function Icon({ size = 16, className, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconCheck({ size = 12, className }) {
  return (
    <Icon size={size} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function IconCalendar({ size = 12, className }) {
  return (
    <Icon size={size} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </Icon>
  );
}

export function IconGift({ size = 12, className }) {
  return (
    <Icon size={size} className={className}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18M12 8c-2-3-6-3-6 0s4 0 6 0c2-3 6-3 6 0s-4 0-6 0" />
    </Icon>
  );
}

export function IconQuote({ size = 32, className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path fill="currentColor" d="M7 17h4l1-4V7H6v6h3zm8 0h4l1-4V7h-6v6h3z" />
    </svg>
  );
}

export function IconUser({ size = 48, className }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </Icon>
  );
}
