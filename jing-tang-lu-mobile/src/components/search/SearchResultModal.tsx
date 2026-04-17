import './SearchResultModal.css';

interface SearchResultModalProps {
  title: string;
  description: string;
  sourceLabel: string;
  entryType: string;
  evidenceProgress?: string;
  actionProgress?: string;
  onClose: () => void;
}

export function SearchResultModal({ title, description, sourceLabel, entryType, evidenceProgress, actionProgress, onClose }: SearchResultModalProps) {
  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal__header">
          <span className="search-modal__icon">★</span>
          <span className="search-modal__title">新线索发现！</span>
        </div>
        <div className="search-modal__body">
          <div className="search-modal__evidence-title">{entryType}：{title}</div>
          <p className="search-modal__desc">{description}</p>
          <div className="search-modal__meta">
            <span className="search-modal__source">来源：{sourceLabel}</span>
          </div>
        </div>
        <div className="search-modal__footer">
          <div className="search-modal__footer-info">
            <span className="search-modal__recorded">✓ 已录入案卷 · {entryType}</span>
            {(evidenceProgress || actionProgress) && (
              <span className="search-modal__progress">{evidenceProgress} · {actionProgress}</span>
            )}
          </div>
          <button className="search-modal__confirm" onClick={onClose}>继续</button>
        </div>
      </div>
    </div>
  );
}
