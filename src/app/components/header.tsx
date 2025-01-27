import React from "react";

interface SubtextProps {
  text: string;
  gradient?: boolean;
}

export default function Header({ text, gradient = false }: SubtextProps) {
  return (
    <span className="header title">
      <span className={gradient ? "gradient" : ""}>{text}</span>
    </span>
  );
}
