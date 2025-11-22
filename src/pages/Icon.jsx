export const DownloadIcon = ({ onClick, style }) => (
  <svg
    onClick={onClick}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: "pointer", ...style }}
  >
    {/* Стрелка вниз */}
    <line x1="12" y1="4" x2="12" y2="16" />
    <polyline points="8 12 12 16 16 12" />
    {/* Нижняя линия */}
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const CopyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: "pointer" }}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// export default CopyIcon;
// export default DownloadIcon;