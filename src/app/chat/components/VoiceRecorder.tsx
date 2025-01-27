'use client';

import React, { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({
        sampleRate: 16000
      });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Connect to WebSocket
      const ws = new WebSocket('ws://localhost:8000/api/speech/ws/speech');
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'success' && data.transcript) {
          setTranscript(prev => prev + ' ' + data.transcript);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
      };

      // Handle audio processing
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const audioData = new Float32Array(inputData);
          
          // Convert to base64
          const bytes = new Uint8Array(audioData.buffer);
          const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
          
          // Send to WebSocket
          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    // Stop the WebSocket first to prevent any more data being sent
    if (websocketRef.current) {
      console.log('Closing WebSocket connection...');
      websocketRef.current.close(1000, 'User stopped recording');
      websocketRef.current = null;
    }

    // Clean up audio processing
    if (processorRef.current && sourceRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      sourceRef.current.disconnect();
      audioContextRef.current.close();
      processorRef.current = null;
      sourceRef.current = null;
      audioContextRef.current = null;
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  // Clean up on component unmount
  React.useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-4 py-2 rounded-full ${
              isRecording
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-4 py-2 rounded-full ${
              !isRecording
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Stop Recording
          </button>
        </div>
        
        <div className="w-full">
          <p className="font-semibold mb-2">Transcript:</p>
          <div className="p-3 bg-gray-50 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto">
            {transcript || 'No transcript yet...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
