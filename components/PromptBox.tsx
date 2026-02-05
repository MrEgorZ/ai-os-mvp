'use client';

import { useState } from 'react';

type PromptBoxProps = {
  blockKey: string;
};

export default function PromptBox({ blockKey }: PromptBoxProps) {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Введите данные для блока ${blockKey}`}
        style={{
          flex: 1,
          padding: 8,
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      />
      <button
        onClick={() => {
          console.log('block:', blockKey, 'value:', value);
        }}
        style={{
          padding: '8px 12px',
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        OK
      </button>
    </div>
  );
}
