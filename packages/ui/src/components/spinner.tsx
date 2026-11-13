import { cn } from "../cx";

export interface SpinnerProps {
  /** Pixels; it inherits the text colour. */
  size?: number;
  /** Read by screen readers. */
  label?: string;
  className?: string;
}

/** Something is loading. Inside a button, the button's own loading prop draws it. */
export function Spinner({ size = 16, label = "Loading", className }: SpinnerProps) {
  return (
    <svg
      className={cn("flex-none animate-spin motion-reduce:[animation-duration:1.5s]", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
