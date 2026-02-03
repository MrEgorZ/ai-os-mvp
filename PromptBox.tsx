"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";

type Props = {
  title: string;
  prompt: string;
};

export default function PromptBox({ title, prompt }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{title}</div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-sm underline"
        >
          {open ? "Скрыть промпт" : "Показать промпт"}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs text-gray-500">
              Нажми «Скопировать» и вставь в ChatGPT/Claude/Gemini.
            </div>
            <CopyButton text={prompt} />
          </div>
          <textarea
            readOnly
            className="w-full h-48 border rounded p-3 text-sm font-mono"
            value={prompt}
          />
        </div>
      )}
    </div>
  );
}
