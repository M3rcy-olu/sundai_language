"use client"
import { useState } from 'react';
import { generateResponse } from '../../../api/typescript/OpenAI';
import { generateSpeech } from '../../../api/typescript/elevenlabsTTS';

export default function LLMToSpeech() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<{ Spanish: string; English: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const playAudio = async (audioData: ArrayBuffer) => {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // First, get the LLM response
      const llmResult = await generateResponse(userInput);
      setResponse(llmResult.response);

      // Then, generate and play speech from the Spanish response
      if (llmResult.response && llmResult.response[0]?.Spanish) {
        const audioData = await generateSpeech({
          text: llmResult.response[0].Spanish
        });
        await playAudio(audioData);
      }

      setUserInput(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error in LLM to Speech:', error);
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your Spanish text here..."
            className="w-full p-2 border rounded-md min-h-[100px] text-black"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : "Submit and Speak"}
        </button>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {response.length > 0 && (
        <div className="mt-6 space-y-4">
          {response.map((item, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="font-semibold text-green-600">
                Spanish: {item.Spanish}
                <button
                  onClick={async () => {
                    try {
                      const audioData = await generateSpeech({
                        text: item.Spanish,
                      });
                      await playAudio(audioData);
                    } catch (error) {
                      console.error("Error playing audio:", error);
                      setError("Failed to play audio. Please try again.");
                    }
                  }}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  🔊 Play
                </button>
              </div>
              <div className="mt-2 text-gray-700">English: {item.English}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
