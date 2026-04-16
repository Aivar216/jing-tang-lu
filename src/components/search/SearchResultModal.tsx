import './SearchResultModal.css';

interface SearchResultModalProps {
  title: string;
  description: string;
  sourceLabel: string;
  entryType: string;
  onClose: () => void;
}

export function SearchResultModal({ title, description, sourceLabel, entryType, onClose }: SearchResultModalProps) {
  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal__header">
          <span className="search-modal__icon">🔍</span>
          <span className="search-modal__title">{title}</span>
        </div>
        <div className="search-modal__body">
          <p className="search-modal__desc">{description}</p>
          <div className="search-modal__meta">
            <span className="search-modal__source">来源：{sourceLabel}</span>
          </div>
        </div>
        <div className="search-modal__footer">
          <span className="search-modal__recorded">✓ 已录入案卷 · {entryType}</span>
          <button className="search-modal__confirm" onClick={onClose}>确认</button>
        </div>
      </div>
    </div>
  );
}
