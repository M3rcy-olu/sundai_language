"use client";
import { useState, useEffect } from "react";
import { generateResponse } from "../../../api/typescript/OpenAI";
import { NextResponse } from "next/server";
import Button from "@/app/components/button";
import Subtext from "@/app/components/subtext";

interface LLMQueryProps {
  initialInput?: string;
}

export default function LLMQuery({ initialInput = "" }: LLMQueryProps) {
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

  useEffect(() => {
    if (initialInput) {
      setUserInput(initialInput);
      handleSubmit(new Event('submit') as any);
    }
  }, [initialInput]);

  // Function to handle voice input
  const handleVoiceInput = (transcript: string) => {
    setUserInput(transcript);
    // Automatically submit after receiving voice input
    handleSubmit(new Event('submit') as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await generateResponse(userInput);
      setResponse(result.response);
      setUserInput(""); // Clear input after successful submission
    } catch (error) {
      console.error("Error in LLM query:", error);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your Spanish text here..."
            className="w-full p-2 border rounded-md min-h-[100px] text-black"
            disabled={isLoading}
          /> */}
        </div>
        <div className="flex justify-center">
          <Button
            text={isLoading ? "Stop" : "Speak"}
            type="submit"
            disabled={isLoading || !userInput.trim()}
          />
        </div>
      </form>
      <div className="mt-[2vh]">
        {error && <Subtext text={error} className="text-red-500" />}
      </div>

      {response.length > 0 && (
        <div className="mt-6 space-y-4">
          {response.map((item, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="font-semibold text-green-600">
                Spanish: {item.Spanish_Response}
              </div>
              <div className="mt-2 text-gray-700">
                English: {item.English_Analysis}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { handleVoiceInput };
