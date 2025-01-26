import React from "react";
import Link from "next/link";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}
export default function Button({ text, type, disabled }: ButtonProps) {
  return (
    <button
      className="speak-button"
      type={type || "button"}
      disabled={disabled || false}
    >
      <span className="scenario">{text}</span>
    </button>
  );
}
