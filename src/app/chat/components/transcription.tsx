"use client";
import { useState } from "react";
import { generateResponse } from "../../../api/typescript/OpenAI";
import { NextResponse } from "next/server";
import Subtext from "@/app/components/subtext";
import TextTransition from "./TextTransition";

interface TranscriptionProps {
  subtitles: string;
  feedback: string;
}

export default function Transcription({
  subtitles,
  feedback,
}: TranscriptionProps) {
  return (
    <main>
      <span className="flex justify-center text-center w-[60vw] h-[8vh] mt-[1vh]">
        <Subtext text={feedback} className="text-[#5D527F]" />
      </span>
      <span className="flex justify-center text-center w-[60vw] h-[6vh] mt-[0vh]">
        <Subtext text={subtitles} />
      </span>
      {/* <span className="flex justify-center text-center w-[60vw] h-[2vh] mt-[0vh]">
        <Subtext
          text="This is a line that would contain the previous sentence that I said."
          className="text-[#555163] text-[1.5vh]"
        />
      </span> */}
    </main>
  );

  // Rest of your component code
}
