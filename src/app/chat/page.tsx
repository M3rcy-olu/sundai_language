'use client';

import React, { useState } from "react";
import Navbar from "../components/navbar";
import ChatBot from "../components/chatbot";
import Subtext from "../components/subtext";
import Transcription from "./components/transcription";
import PageTransition from "../components/PageTransition";
import LLMToSpeech from "./components/LLMToSpeech";
import VoiceRecorder from "./components/VoiceRecorder";

export default function Chat() {
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const handleVoiceTranscript = (transcript: string) => {
    setVoiceTranscript(transcript);
  };

  return (
    <PageTransition>
      <main className="page-alignment gap-[10vh]">
        <VoiceRecorder onTranscriptComplete={handleVoiceTranscript} />
        <LLMToSpeech initialInput={voiceTranscript} />
        <Navbar />
        <ChatBot showText={false} />
        <Transcription />
      </main>
    </PageTransition>
  );
}
