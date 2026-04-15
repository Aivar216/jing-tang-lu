import { useState } from 'react';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../../utils/settings';
import type { AppSettings } from '../../utils/settings';
import { testConnection } from '../../api/client';
import './SettingsModal.css';

interface Props {
  onClose: () => void;
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'fail';

export function SettingsModal({ onClose }: Props) {
  const [form, setForm] = useState<AppSettings>(() => loadSettings());
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMsg, setTestMsg] = useState('');

  const set = (key: keyof AppSettings, value: string) => {
    setSaved(false);
    setTestStatus('idle');
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Strip invisible/non-ASCII characters that break HTTP headers
    const cleaned: AppSettings = {
      ...form,
      apiKey: form.apiKey.replace(/[^\x20-\x7E]/g, '').trim(),
      baseURL: form.baseURL.trim(),
      npcModel: form.npcModel.trim(),
      extractorModel: form.extractorModel.trim(),
    };
    setForm(cleaned);
    saveSettings(cleaned);
    setSaved(true);
    onClose(); // Bug #1：保存后自动关闭
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SETTINGS });
    setSaved(false);
    setTestStatus('idle');
  };

  const handleTest = async () => {
    if (!form.apiKey.trim()) {
      setTestStatus('fail');
      setTestMsg('请先填写 API Key');
      return;
    }
    setTestStatus('testing');
    setTestMsg('');
    try {
      const reply = await testConnection(
        form.apiKey,
        form.baseURL,
        form.npcModel || DEFAULT_SETTINGS.npcModel
      );
      setTestStatus('ok');
      setTestMsg(`连通成功 · 模型回复：${reply.trim().slice(0, 60)}`);
    } catch (err) {
      setTestStatus('fail');
      setTestMsg(err instanceof Error ? err.message : '连接失败');
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-modal__header">
          <span>API 设置</span>
          <button className="settings-close-btn" onClick={onClose} title="关闭">✕</button>
        </div>

        <div className="settings-modal__body">

          {/* API Key */}
          <div className="settings-field">
            <label className="settings-field__label">API Key</label>
            <div className="settings-field__row">
              <input
                type={showKey ? 'text' : 'password'}
                className="settings-input"
                value={form.apiKey}
                onChange={e => set('apiKey', e.target.value)}
                placeholder="sk-..."
                spellCheck={false}
                autoComplete="off"
              />
              <button className="settings-toggle-btn" onClick={() => setShowKey(s => !s)}>
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="settings-field">
            <label className="settings-field__label">
              API Base URL
              <span className="settings-field__hint">OpenAI 兼容接口地址</span>
            </label>
            <input
              type="text"
              className="settings-input"
              value={form.baseURL}
              onChange={e => set('baseURL', e.target.value)}
              placeholder="https://your-proxy.com/v1/chat/completions"
              spellCheck={false}
            />
          </div>

          {/* NPC Model */}
          <div className="settings-field">
            <label className="settings-field__label">
              NPC 对话模型
              <span className="settings-field__hint">问询与升堂对质</span>
            </label>
            <input
              type="text"
              className="settings-input"
              value={form.npcModel}
              onChange={e => set('npcModel', e.target.value)}
              placeholder="deepseek-v3"
              spellCheck={false}
            />
          </div>

          {/* Extractor Model */}
          <div className="settings-field">
            <label className="settings-field__label">
              笔记提取模型
              <span className="settings-field__hint">建议用快速模型</span>
            </label>
            <input
              type="text"
              className="settings-input"
              value={form.extractorModel}
              onChange={e => set('extractorModel', e.target.value)}
              placeholder="deepseek-v3"
              spellCheck={false}
            />
          </div>

          {testStatus !== 'idle' && (
            <div className={`settings-test-result settings-test-result--${testStatus}`}>
              {testStatus === 'testing' && <span className="loading-dots">正在测试连接</span>}
              {testStatus === 'ok' && `✓ ${testMsg}`}
              {testStatus === 'fail' && `✗ ${testMsg}`}
            </div>
          )}

          {saved && testStatus === 'idle' && (
            <div className="settings-saved">✓ 已保存，下次 API 调用即生效</div>
          )}
        </div>

        <div className="settings-modal__footer">
          <button className="settings-btn settings-btn--reset" onClick={handleReset}>
            恢复默认
          </button>
          <button
            className="settings-btn settings-btn--test"
            onClick={handleTest}
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'testing' ? '测试中…' : '测试连接'}
          </button>
          <button className="settings-btn settings-btn--cancel" onClick={onClose}>
            取消
          </button>
          <button className="settings-btn settings-btn--save" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
