interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" style={{ flexShrink: 0 }}>
      <circle cx="17" cy="17" r="16" fill="#fff" />
      <path d="M17,17 L17,1 A16,16 0 0,1 33,17 Z" fill="#2E8B57" />
      <path d="M17,17 L33,17 A16,16 0 0,1 17,33 Z" fill="#B8860C" />
      <path d="M17,17 L17,33 A16,16 0 0,1 1,17 Z" fill="#027BFF" />
      <path d="M17,17 L1,17 A16,16 0 0,1 17,1 Z" fill="#C0392B" />
    </svg>
  );
}
