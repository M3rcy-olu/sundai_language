import React from "react";

interface SubtextProps {
  text: string;
  className?: string;
}

export default function Subtext({ text, className }: SubtextProps) {
  return (
    <span className="subtext">
      <span className={className || ""}>{text}</span>
    </span>
  );
}
