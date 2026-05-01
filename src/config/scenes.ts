import type { Scene, SceneKey } from '../types';

export const SCENES: Scene[] = [
  {
    id: 'academic',
    name: '学术润色',
    icon: '🎓',
    systemPrompt:
      '你是一位学术写作专家。请将以下文本改写为正式学术语气，消除口语化表达，使用学术词汇和复杂句式，保持原文核心含义不变。',
  },
  {
    id: 'business_email',
    name: '商务邮件',
    icon: '✉️',
    systemPrompt:
      '你是一位资深商务沟通专家。请将以下文本改写为专业商务邮件格式，结构清晰（问候→正文→行动项→结尾），语气得体但不冗长。',
  },
  {
    id: 'social_media',
    name: '社交媒体',
    icon: '📱',
    systemPrompt:
      '你是一位社交媒体运营专家。请将以下文本改写为适合社交平台发布的形式，语气轻松活泼，可适度使用 emoji，控制在 280 字以内，吸引互动。',
  },
  {
    id: 'tech_doc',
    name: '技术文档',
    icon: '📋',
    systemPrompt:
      '你是一位技术文档工程师。请将以下文本改写为标准技术文档格式，使用精确术语，步骤编号，保留代码格式，使用被动语态。',
  },
  {
    id: 'creative',
    name: '创意写作',
    icon: '✨',
    systemPrompt:
      '你是一位文学创作导师。请将以下文本进行创意改写，运用修辞手法（比喻、排比、拟人等），增强文字的表现力和节奏感。',
  },
  {
    id: 'translation',
    name: '翻译优化',
    icon: '🌐',
    systemPrompt:
      '你是一位专业翻译。如果输入是中文，请翻译为地道英文；如果输入是英文，请翻译为流畅中文。不要逐字翻译，要符合目标语言的表达习惯。',
  },
];

export const DEFAULT_SCENE_KEY: SceneKey = 'academic';
