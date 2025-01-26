import React from "react";
import LLMQuery from "./components/LLMQuery";
import Navbar from "../components/navbar";
import ChatBot from "../components/chatbot";
import Subtext from "../components/subtext";
import Transcription from "./components/transcription";

export default function Chat() {
  return (
    <main className="page-alignment gap-[10vh]">
      <Navbar />
      <ChatBot showText={false} />
      <Transcription />
      <LLMQuery />
    </main>
  );
}
