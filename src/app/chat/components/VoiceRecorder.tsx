"use client";

import Button from "@/app/components/button";
import Subtext from "@/app/components/subtext";
import React, { useState, useRef, useEffect } from "react";

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  isSaving: boolean;
}

const VoiceRecorder = ({
  onTranscriptComplete,
  isSaving,
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Store all audio chunks during recording
  const audioBufferRef = useRef<Float32Array[]>([]);
  const CHUNKS_TO_BUFFER = 8; // Buffer 8 chunks before sending (about 1 second of audio)

  useEffect(() => {
    // Initialize audio context and get permissions early
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1
          } 
        });
        streamRef.current = stream;
        stream.getTracks().forEach(track => track.stop()); // Stop initial stream
        
        const audioContext = new AudioContext({
          sampleRate: 16000
        });
        audioContextRef.current = audioContext;
        audioContext.suspend(); // Suspend until needed
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    
    initAudio();
    
    // Cleanup function
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    setTranscript('');
    setIsProcessing(false);
    setProcessingStatus('');
    try {
      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      
      // Resume existing audio context or create new one if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({
          sampleRate: 16000
        });
      }
      await audioContextRef.current.resume();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      // Connect to WebSocket
      const ws = new WebSocket("ws://localhost:8000/api/speech/ws/speech");
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        // Clear buffer on new connection
        audioBufferRef.current = [];
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        if (data.status === 'success' && data.transcript) {
          console.log('Setting transcript:', data.transcript);
          setTranscript(data.transcript);
          setIsProcessing(false);
          // Send transcript to parent component immediately
          onTranscriptComplete(data.transcript);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        // Clear buffer on connection close
        audioBufferRef.current = [];
      };

      // Handle audio processing
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);
        
        // Add chunk to buffer
        audioBufferRef.current.push(audioData);
        
        // Log audio stats
        const maxAmplitude = Math.max(...Array.from(audioData).map(Math.abs));
        console.log(`Audio chunk stats: length=${audioData.length}, max amplitude=${maxAmplitude.toFixed(4)}`);
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    setIsProcessing(true);
    setProcessingStatus('Preparing audio data...');
    
    // Clean up audio processing first
    try {
      if (processorRef.current && sourceRef.current && audioContextRef.current) {
        processorRef.current.disconnect();
        sourceRef.current.disconnect();
        await audioContextRef.current.close();
        processorRef.current = null;
        sourceRef.current = null;
        audioContextRef.current = null;
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }

    setIsRecording(false);
    
    // Send all accumulated audio
    if (websocketRef.current && audioBufferRef.current.length > 0) {
      try {
        // Combine chunks in smaller batches to prevent memory issues
        const BATCH_SIZE = 100; // Process 100 chunks at a time
        const totalChunks = audioBufferRef.current.length;
        const processedChunks: Float32Array[] = [];
        
        for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
          setProcessingStatus(`Processing audio batch ${Math.min(i + BATCH_SIZE, totalChunks)}/${totalChunks}...`);
          const batchChunks = audioBufferRef.current.slice(i, i + BATCH_SIZE);
          const batchLength = batchChunks.reduce((sum, chunk) => sum + chunk.length, 0);
          const batchAudio = new Float32Array(batchLength);
          
          let offset = 0;
          batchChunks.forEach(chunk => {
            batchAudio.set(chunk, offset);
            offset += chunk.length;
          });
          
          processedChunks.push(batchAudio);
          // Small delay to allow UI updates
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        setProcessingStatus('Combining audio data...');
        const totalLength = processedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedAudio = new Float32Array(totalLength);
        let offset = 0;
        
        processedChunks.forEach(chunk => {
          combinedAudio.set(chunk, offset);
          offset += chunk.length;
        });
        
        setProcessingStatus('Converting to base64...');
        const bytes = new Uint8Array(combinedAudio.buffer);
        
        // Convert to base64 using Blob and FileReader
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        // Send complete audio for processing
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          setProcessingStatus('Sending audio for transcription...');
          
          // Wait for transcription response
          const transcriptionComplete = new Promise<void>((resolve, reject) => {
            const messageHandler = (event: MessageEvent) => {
              try {
                const response = JSON.parse(event.data);
                if (response.status === 'success' && response.transcript) {
                  setTranscript(response.transcript);
                  resolve();
                } else if (response.status === 'error') {
                  reject(new Error(response.message || 'Transcription failed'));
                }
              } catch (error) {
                console.error('Error parsing WebSocket message:', error);
              }
            };
            
            const closeHandler = () => {
              websocketRef.current?.removeEventListener('message', messageHandler);
              websocketRef.current?.removeEventListener('close', closeHandler);
              reject(new Error('WebSocket closed before receiving transcription'));
            };
            
            websocketRef.current?.addEventListener('message', messageHandler);
            websocketRef.current?.addEventListener('close', closeHandler);
            
            // Remove the event listeners after 30 seconds (timeout)
            setTimeout(() => {
              websocketRef.current?.removeEventListener('message', messageHandler);
              websocketRef.current?.removeEventListener('close', closeHandler);
              reject(new Error('Transcription timeout'));
            }, 30000);
          });
          
          // Send the audio data
          websocketRef.current.send(JSON.stringify({ 
            audio: base64Audio,
            complete: true
          }));
          console.log(`Sent complete audio: length=${totalLength}, chunks=${totalChunks}`);
          
          try {
            await transcriptionComplete;
            setProcessingStatus('Transcription complete');
          } catch (error: unknown) {
            console.error('Transcription error:', error);
            setProcessingStatus('Transcription failed: ' + (error instanceof Error ? error.message : String(error)));
          } finally {
            // Close WebSocket after transcription attempt (success or failure)
            if (websocketRef.current?.readyState === WebSocket.OPEN) {
              console.log('Closing WebSocket connection...');
              websocketRef.current.close(1000, 'Transcription complete');
              websocketRef.current = null;
            }
          }
        } else {
          console.error('WebSocket is not open');
          setProcessingStatus('Error: WebSocket connection lost');
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        setProcessingStatus('Error processing audio');
      }
    } else {
      console.log('No audio to process');
      setProcessingStatus('No audio to process');
    }
    
    // Clear the buffer
    audioBufferRef.current = [];
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Subtext text={transcript || "No transcript yet..."} />
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        text={isRecording ? "Stop" : "Speak"}
        disabled={isSaving}
      />
    </div>
  );
};

export default VoiceRecorder;
