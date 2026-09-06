export function BrandMark() {
  return (
    <span className="aegora-wordmark" aria-hidden="true">
      <svg
        viewBox="0 0 720 120"
        role="img"
        aria-label="AEGORA"
        focusable="false"
      >
        <defs>
          <linearGradient id="aegora-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a3dff" />
            <stop offset="100%" stopColor="#6c35f2" />
          </linearGradient>
          <linearGradient id="aegora-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1185ff" />
            <stop offset="100%" stopColor="#2c5ff0" />
          </linearGradient>
          <linearGradient id="aegora-dot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2fd3c7" />
            <stop offset="100%" stopColor="#20b8ad" />
          </linearGradient>
        </defs>

        <g transform="translate(6 6)">
          <path
            d="M54 10 L12 94 H48"
            fill="none"
            stroke="url(#aegora-left)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M68 10 L112 94 H78"
            fill="none"
            stroke="url(#aegora-right)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="61" cy="66" r="17" fill="url(#aegora-dot)" />
        </g>

        <text
          x="148"
          y="87"
          fill="#17112f"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="72"
          fontWeight="800"
          letterSpacing="-3"
        >
          AEGORA
        </text>
      </svg>
      <style>{`
        .aegora-wordmark {
          display: inline-flex;
          align-items: center;
          width: clamp(142px, 13vw, 184px);
          line-height: 0;
        }

        .aegora-wordmark svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .brand > .aegora-wordmark + span {
          display: none;
        }
      `}</style>
    </span>
  );
}
