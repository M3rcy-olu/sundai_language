import React from "react";
import LLMQuery from "./components/LLMQuery";
import Navbar from "../components/navbar";
import ChatBot from "../components/chatbot";
import Subtext from "../components/subtext";
import Transcription from "./components/transcription";
import PageTransition from "../components/PageTransition";

export default function Chat() {
  return (
    <PageTransition>
      <main className="page-alignment gap-[10vh]">
        <Navbar />
        <ChatBot showText={false} />
        <Transcription />
        <LLMQuery />
      </main>
    </PageTransition>
  );
}
