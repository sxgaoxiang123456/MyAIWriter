interface Props {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export default function PolishButton({ disabled, loading, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
        ${disabled || loading
          ? 'bg-blue-400 opacity-50 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'}
      `}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading ? '润色中...' : '润色'}
    </button>
  );
}
