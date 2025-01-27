import React from "react";
import Link from "next/link";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}
export default function Button({ text, type, disabled, onClick }: ButtonProps) {
  return (
    <button
      className="speak-button"
      type={type || "button"}
      disabled={disabled || false}
      onClick={onClick}
    >
      <span className="scenario">{text}</span>
    </button>
  );
}
