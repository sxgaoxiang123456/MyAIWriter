import type { ResultState } from '../types';
import CopyButton from './CopyButton';

interface Props {
  state: ResultState;
}

export default function ResultPanel({ state }: Props) {
  if (state.status === 'idle') {
    return (
      <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-400">润色结果将在此显示</p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 border border-gray-200 rounded-lg bg-white">
        <svg
          className="animate-spin h-6 w-6 text-blue-500"
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
        <p className="text-sm text-gray-500">润色中...</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex items-center h-full">
        <div className="w-full p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.message}
        </div>
      </div>
    );
  }

  // status === 'success'
  return (
    <div className="flex flex-col h-full gap-2">
      <textarea
        readOnly
        value={state.text}
        className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none bg-white text-sm focus:outline-none"
      />
      <div className="flex justify-end">
        <CopyButton text={state.text} />
      </div>
    </div>
  );
}
