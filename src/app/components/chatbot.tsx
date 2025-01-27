import React from "react";
import { motion } from "framer-motion";

interface ChatBotProps {
  showText: boolean;
}

export default function ChatBot({ showText }: ChatBotProps) {
  const bars = [
    { height: "9vh" }, // 40px -> 3.33vh
    { height: "15vh" }, // 60px -> 5vh
    { height: "18vh" }, // 80px -> 6.67vh
    { height: "15vh" }, // 60px -> 5vh
    { height: "9vh" },
  ];

  return (
    <main className="ai h-[13vw] mt-[20vh]">
      <div className="circle"></div>
      {/* <div className="flex justify-center items-center gap-4 h-[6.67vh]">
        {bars.map((bar, index) => (
          <motion.div
            key={index}
            initial={{ height: "1.67vh" }}
            animate={{
              height: bar.height,
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                delay: index * 0.2,
                ease: [0.98, 0, 0, 0.99],
              },
            }}
            className="w-10 rounded-full circle"
          ></motion.div>
        ))}
      </div> */}
      <p>{showText ? "Hola, como estas?" : ""}</p>
    </main>
  );
}
