type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = "", compact = false }: BrandLogoProps) {
  return (
    <div className={`brand-logo ${className}`}>
      <span className="brand-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M8 22V12" />
          <path d="M16 22V8" />
          <path d="M24 22V15" />
          <path d="M7 23h18" />
          <path d="m8 18 6-5 5 4 6-8" />
        </svg>
      </span>

      {!compact ? (
        <span className="brand-logo-text">
          <strong>Minhas Finanças</strong>
          <small>Controle pessoal</small>
        </span>
      ) : null}
    </div>
  );
}
