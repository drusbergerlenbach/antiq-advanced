interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M256 25L443.77 140.625V371.875L256 487.5L68.23 371.875V140.625L256 25Z" fill="#1E2A38" stroke="#FFC857" strokeWidth="15"/>
      <path d="M256 128L362.487 192V320L256 384L149.513 320V192L256 128Z" fill="#FFC857"/>
      <circle cx="256" cy="200" r="28" fill="#1E2A38"/>
      <path d="M256 235 L256 295" stroke="#1E2A38" strokeWidth="22" strokeLinecap="round"/>
      <ellipse cx="256" cy="310" rx="48" ry="38" fill="#1E2A38"/>
      <circle cx="212" cy="340" r="14" fill="#1E2A38"/>
      <circle cx="256" cy="350" r="14" fill="#1E2A38"/>
      <circle cx="300" cy="340" r="14" fill="#1E2A38"/>
    </svg>
  );
}
