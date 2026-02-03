"use client";

import { useState } from "react";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ text, label = "Скопировать", className }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={className ?? "px-3 py-2 rounded border text-sm hover:bg-gray-50"}
      title="Скопировать в буфер обмена"
    >
      {copied ? "Скопировано ✅" : label}
    </button>
  );
}
