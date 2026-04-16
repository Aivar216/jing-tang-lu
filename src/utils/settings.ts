export interface AppSettings {
  apiKey: string;
  baseURL: string;
  npcModel: string;
  extractorModel: string;
}

const STORAGE_KEY = 'jing-tang-lu-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  npcModel: 'glm-4-plus',
  extractorModel: 'glm-4-flash',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
