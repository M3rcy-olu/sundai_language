"use client";
import { useState } from "react";
import { generateResponse } from "../../../api/typescript/OpenAI";
import { generateSpeech } from "../../../api/typescript/elevenlabsTTS";
import Transcription from "./transcription";
import Button from "@/app/components/button";
import TextTransition from "./TextTransition";
import { AnimatePresence, motion } from "framer-motion";

export default function LLMToSpeech() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState<
    {
      Student_Spanish: string;
      Spanish_Response: string;
      English_Analysis: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    try {
      // First, get the LLM response
      const llmResult = await generateResponse(userInput);
      setResponse(llmResult.response);

      // Then, generate and play speech from the Spanish response
      if (llmResult.response && llmResult.response[0]?.Spanish_Response) {
        const audioData = await generateSpeech({
          text: llmResult.response[0].Spanish_Response,
        });
        await playAudio(audioData);
      }

      setUserInput(""); // Clear input after successful submission
    } catch (error) {
      console.error("Error in LLM to Speech:", error);
      setError("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {response.length > 0 && (
        <div>
          {response.map((item, index) => (
            <div key={index}>
              <AnimatePresence mode="wait">
                <TextTransition
                  key={item.Spanish_Response || item.English_Analysis}
                >
                  <Transcription
                    subtitles={item.Spanish_Response}
                    feedback={item.English_Analysis}
                  />
                </TextTransition>
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
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
        <div className="flex justify-center">
          <Button
            text={isLoading ? "Stop" : "Speak"}
            type="submit"
            disabled={isLoading || !userInput.trim()}
          />
        </div>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
