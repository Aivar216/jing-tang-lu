import { loadSettings } from '../utils/settings';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMParams {
  system: string;
  messages: LLMMessage[];
  maxTokens: number;
  modelOverride?: string;
}

/** All LLM calls use OpenAI-compatible format via fetch */
export async function callLLM(params: LLMParams): Promise<string> {
  const s = loadSettings();
  const model = params.modelOverride ?? s.npcModel;
  return callOpenAICompat(params, model, s.apiKey, s.baseURL);
}

export async function callLLMExtractor(params: LLMParams): Promise<string> {
  const s = loadSettings();
  return callLLM({ ...params, modelOverride: s.extractorModel });
}

/** Strip any non-printable or non-ASCII characters that would break HTTP headers */
function sanitizeHeader(value: string): string {
  // Keep only printable ASCII (0x20–0x7E), remove everything else (including BOM, zero-width spaces, etc.)
  return value.replace(/[^\x20-\x7E]/g, '').trim();
}

async function callOpenAICompat(
  params: LLMParams,
  model: string,
  apiKey: string,
  baseURL: string
): Promise<string> {
  const safeKey = sanitizeHeader(apiKey);
  if (!safeKey) throw new Error('API Key 为空或包含无效字符，请重新填写');

  let targetUrl = baseURL.trim().replace(/\/$/, '');
  if (!targetUrl.endsWith('/chat/completions')) {
    targetUrl = targetUrl.replace(/\/v1$/, '') + '/v1/chat/completions';
  }

  // Dev: Vite middleware at /dev-proxy; Prod: Vercel serverless function at /api/proxy
  const proxyPath = import.meta.env.DEV ? '/dev-proxy' : '/api/proxy';
  const fetchUrl = proxyPath;
  const extraHeaders: Record<string, string> = { 'X-Target': targetUrl };

  const res = await fetch(fetchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${safeKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      stream: false,          // 明确禁用流式，确保返回完整 JSON
      max_tokens: params.maxTokens,
      messages: [
        { role: 'system', content: params.system },
        ...params.messages,
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    const hint: Record<number, string> = {
      401: '认证失败，请检查 API Key 是否正确',
      403: '无权限访问，请确认 Key 或账户状态',
      429: '请求过于频繁，请稍后重试',
      500: 'API 服务器内部错误，请稍后重试',
      502: 'API 网关错误，请稍后重试',
      503: 'API 服务暂时不可用（上游超时），请稍后重试',
    };
    const friendly = hint[res.status] ?? `HTTP ${res.status}`;
    throw new Error(`${friendly}：${errText}`);
  }

  // 先取原始文本，避免 JSON.parse 隐藏错误细节
  const rawText = await res.text();
  let data: { choices?: { message?: { content?: string }; finish_reason?: string }[]; error?: { message?: string } };
  try {
    data = JSON.parse(rawText);
  } catch {
    // 可能是 SSE 流数据或纯文本
    const preview = rawText.slice(0, 120);
    throw new Error(`响应非 JSON 格式（前120字符）：${preview}`);
  }

  if (data.error?.message) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    const finishReason = data.choices?.[0]?.finish_reason ?? '未知';
    const preview = JSON.stringify(data).slice(0, 200);
    throw new Error(`返回内容为空（finish_reason: ${finishReason}）。原始数据：${preview}`);
  }
  return text;
}

export async function testConnection(
  apiKey: string,
  baseURL: string,
  model: string
): Promise<string> {
  return callOpenAICompat(
    { system: 'You are a test assistant.', messages: [{ role: 'user', content: 'reply with the single word: ok' }], maxTokens: 32 },
    model,
    apiKey,
    baseURL
  );
}

export function getNpcModel(): string { return loadSettings().npcModel; }
export function getExtractorModel(): string { return loadSettings().extractorModel; }
