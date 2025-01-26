"use client";
import { useState } from "react";
import { generateResponse } from "../../../api/typescript/OpenAI";
import { NextResponse } from "next/server";
import Subtext from "@/app/components/subtext";

// TODO: Implement the UI for this component
// Component that queries the LLM and returns the reponse

export default function Transcription() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState<
    { Spanish: string; English: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main>
      <span className="flex justify-center text-center w-[60vw] h-[8vh] mt-[1vh]">
        <Subtext
          text="Hola, ¡inicia la conversación presionando abajo!"
          className="text-[#5D527F]"
        />
      </span>
      <span className="flex justify-center text-center w-[60vw] h-[5vh] mt-[0vh]">
        <Subtext text="Hi, start the conversation by pressing below!" />
      </span>
      <span className="flex justify-center text-center w-[60vw] h-[0vh] mt-[0vh]">
        <Subtext
          text="This is a line that would contain the previous sentence that I said."
          className="text-[#555163] text-[1.5vh]"
        />
      </span>
    </main>
  );

  // Rest of your component code
}
