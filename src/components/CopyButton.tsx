import { useState } from 'react';

interface Props {
  text: string;
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
    >
      {copied ? '已复制 ✓' : '复制'}
    </button>
  );
}
