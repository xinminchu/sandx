export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 56"
      role="img"
      aria-label="ERBOT logo"
    >
      <rect x="4" y="2" width="56" height="52" rx="13" fill="#0d9488" />
      <line
        x1="18"
        y1="12"
        x2="18"
        y2="44"
        stroke="#fff"
        strokeWidth="2.5"
        opacity="0.45"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="12"
        x2="35"
        y2="20.5"
        stroke="#fff"
        strokeWidth="1.6"
        opacity="0.5"
      />
      <line
        x1="22"
        y1="28"
        x2="32.5"
        y2="28"
        stroke="#fff"
        strokeWidth="1.6"
        opacity="0.5"
      />
      <line
        x1="22"
        y1="44"
        x2="35"
        y2="35.5"
        stroke="#fff"
        strokeWidth="1.6"
        opacity="0.5"
      />
      <circle cx="18" cy="12" r="3.6" fill="#fff" />
      <circle cx="18" cy="28" r="3.6" fill="#fff" />
      <circle cx="18" cy="44" r="3.6" fill="#fff" />
      <circle cx="46" cy="28" r="10.5" fill="#fff" />
      <text
        x="46"
        y="32.8"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#0d9488"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        R
      </text>
    </svg>
  );
}

export default function Logo({
  markSize = 30,
  wordmarkSize = 11,
}: {
  markSize?: number;
  wordmarkSize?: number;
}) {
  return (
    <span className="flex flex-col items-center leading-none select-none">
      <LogoMark size={markSize} />
      <span
        className="font-extrabold text-slate-800"
        style={{ fontSize: wordmarkSize, marginTop: 3 }}
      >
        ERBOT
      </span>
    </span>
  );
}
