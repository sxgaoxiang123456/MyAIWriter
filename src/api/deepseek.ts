import type { PolishRequest, PolishResponse } from '../types';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const ENDPOINT = '/api/chat/completions';
const MODEL = 'deepseek-chat';

export async function polishText(
  req: PolishRequest,
  systemPrompt: string,
): Promise<PolishResponse> {
  // 条件降级：无真实 Key 时返回 mock 结果，无需改代码切换
  if (!API_KEY || API_KEY === 'sk-placeholder') {
    return {
      result: `【Mock 结果，场景: ${systemPrompt.slice(0, 20)}】\n${req.text}`,
    };
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: req.text },
        ],
      }),
    });
  } catch {
    throw new Error('网络连接失败，请检查网络后重试');
  }

  if (!response.ok) {
    throw new Error('润色服务暂时不可用，请稍后再试');
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (content === undefined) {
    throw new Error('收到异常响应，请重试');
  }

  return { result: content };
}
