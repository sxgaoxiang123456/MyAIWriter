import type { Scene, SceneKey } from '../types';

interface Props {
  scenes: Scene[];
  selected: SceneKey;
  onChange: (key: SceneKey) => void;
}

export default function SceneSelector({ scenes, selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onChange(scene.id)}
          className={
            scene.id === selected
              ? 'px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white'
              : 'px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        >
          {scene.name}
        </button>
      ))}
    </div>
  );
}
