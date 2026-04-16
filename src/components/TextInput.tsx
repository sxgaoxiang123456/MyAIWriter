interface Props {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  maxLength: number;
}

export default function TextInput({ value, onChange, onClear, maxLength }: Props) {
  const isOverLimit = value.length > maxLength;

  return (
    <div className="flex flex-col h-full gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请粘贴或输入待润色的文本..."
        className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {value.length} / {maxLength}
          {isOverLimit && ' · 超出字数限制'}
        </span>
        <button
          onClick={onClear}
          disabled={value.length === 0}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          清空
        </button>
      </div>
    </div>
  );
}
