import { useState } from 'react';
import type { ResultState, SceneKey } from './types';
import { SCENES, DEFAULT_SCENE_KEY } from './config/scenes';
import { polishText } from './api/deepseek';
import SceneSelector from './components/SceneSelector';
import TextInput from './components/TextInput';
import PolishButton from './components/PolishButton';
import ResultPanel from './components/ResultPanel';

const MAX_LENGTH = 3000;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedScene, setSelectedScene] = useState<SceneKey>(DEFAULT_SCENE_KEY);
  const [resultState, setResultState] = useState<ResultState>({ status: 'idle' });

  const isOverLimit = inputText.length > MAX_LENGTH;
  const isPolishDisabled =
    inputText.trim() === '' || isOverLimit || resultState.status === 'loading';

  const handlePolish = async () => {
    const scene = SCENES.find((s) => s.id === selectedScene);
    if (!scene) return;

    setResultState({ status: 'loading' });
    try {
      const response = await polishText(
        { text: inputText, scene: selectedScene },
        scene.systemPrompt,
      );
      setResultState({ status: 'success', text: response.result });
    } catch (err) {
      const message = err instanceof Error ? err.message : '发生未知错误，请重试';
      setResultState({ status: 'error', message });
    }
  };

  const handleClear = () => {
    setInputText('');
    setResultState({ status: 'idle' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-800 mb-3">AI Text Polisher</h1>
          <SceneSelector
            scenes={SCENES}
            selected={selectedScene}
            onChange={setSelectedScene}
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Left: input */}
          <div className="flex flex-col gap-3" style={{ minHeight: '480px' }}>
            <TextInput
              value={inputText}
              onChange={setInputText}
              onClear={handleClear}
              maxLength={MAX_LENGTH}
            />
          </div>

          {/* Right: result */}
          <div className="flex flex-col" style={{ minHeight: '480px' }}>
            <ResultPanel state={resultState} />
          </div>
        </div>

        {/* Polish button */}
        <div className="flex justify-center pt-2">
          <PolishButton
            disabled={isPolishDisabled}
            loading={resultState.status === 'loading'}
            onClick={handlePolish}
          />
        </div>
      </main>
    </div>
  );
}
