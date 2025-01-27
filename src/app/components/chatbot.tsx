import React from "react";

interface ChatBotProps {
  showText: boolean;
}
export default function ChatBot({ showText = true }: ChatBotProps) {
  return (
    <main className="ai h-[13vw]">
      <div className="circle"></div>
      <p>{showText ? "Hola, como estas?" : ""}</p>
    </main>
  );
}
