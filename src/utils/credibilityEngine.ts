export function getCredibilityLabel(score: number): string {
  if (score >= 80) return '声望卓著';
  if (score >= 60) return '尚可信任';
  if (score >= 40) return '有失公允';
  return '声名狼藉';
}

export function getCredibilityColor(score: number): string {
  // topbar 背景为深色（--color-ink），需要浅色文字对比
  if (score >= 80) return 'var(--color-gold-light)';
  if (score >= 60) return 'var(--color-court-text)';   // 米白
  if (score >= 40) return '#f0a060';                   // 亮橙，深背景可见
  return '#f47070';                                     // 亮红，深背景可见（Bug #7）
}
