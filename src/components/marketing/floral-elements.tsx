export function FloralLeaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M60 10C60 10 20 60 20 120C20 160 40 190 60 190C80 190 100 160 100 120C100 60 60 10 60 10Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M60 30V180"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <path
        d="M60 60C45 70 30 90 28 110"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.15"
      />
      <path
        d="M60 80C75 90 90 105 92 120"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.15"
      />
      <path
        d="M60 110C42 120 32 140 30 155"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.15"
      />
    </svg>
  );
}

export function FloralPetal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Centre */}
      <circle cx="100" cy="100" r="12" fill="currentColor" opacity="0.2" />
      {/* Petals */}
      <ellipse cx="100" cy="55" rx="18" ry="35" fill="currentColor" opacity="0.12" />
      <ellipse cx="100" cy="145" rx="18" ry="35" fill="currentColor" opacity="0.12" />
      <ellipse cx="55" cy="100" rx="35" ry="18" fill="currentColor" opacity="0.12" />
      <ellipse cx="145" cy="100" rx="35" ry="18" fill="currentColor" opacity="0.12" />
      <ellipse
        cx="68"
        cy="68"
        rx="18"
        ry="35"
        fill="currentColor"
        opacity="0.1"
        transform="rotate(-45 68 68)"
      />
      <ellipse
        cx="132"
        cy="68"
        rx="18"
        ry="35"
        fill="currentColor"
        opacity="0.1"
        transform="rotate(45 132 68)"
      />
      <ellipse
        cx="68"
        cy="132"
        rx="18"
        ry="35"
        fill="currentColor"
        opacity="0.1"
        transform="rotate(45 68 132)"
      />
      <ellipse
        cx="132"
        cy="132"
        rx="18"
        ry="35"
        fill="currentColor"
        opacity="0.1"
        transform="rotate(-45 132 132)"
      />
    </svg>
  );
}

export function FloralBranch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main stem */}
      <path
        d="M150 20C150 20 140 100 145 200C148 260 155 340 160 380"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.15"
      />
      {/* Left leaves */}
      <path
        d="M145 80C145 80 100 60 80 80C60 100 90 110 145 100"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M146 160C146 160 95 130 70 155C45 180 85 195 146 175"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M150 260C150 260 100 235 78 258C56 281 95 295 150 275"
        fill="currentColor"
        opacity="0.1"
      />
      {/* Right leaves */}
      <path
        d="M148 120C148 120 195 95 215 118C235 141 200 150 148 138"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M150 210C150 210 200 185 222 208C244 231 205 245 150 225"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M155 310C155 310 205 290 222 310C239 330 205 342 155 325"
        fill="currentColor"
        opacity="0.1"
      />
      {/* Small buds */}
      <circle cx="80" cy="78" r="5" fill="currentColor" opacity="0.15" />
      <circle cx="215" cy="116" r="5" fill="currentColor" opacity="0.15" />
      <circle cx="70" cy="153" r="6" fill="currentColor" opacity="0.15" />
      <circle cx="222" cy="206" r="5" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

export function FloralRose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer petals */}
      <path
        d="M80 20C80 20 40 30 30 60C20 90 50 100 80 80C110 100 140 90 130 60C120 30 80 20 80 20Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M80 140C80 140 40 130 30 100C20 70 50 60 80 80C110 60 140 70 130 100C120 130 80 140 80 140Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M20 80C20 80 30 40 60 30C90 20 100 50 80 80C100 110 90 140 60 130C30 120 20 80 20 80Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M140 80C140 80 130 40 100 30C70 20 60 50 80 80C60 110 70 140 100 130C130 120 140 80 140 80Z"
        fill="currentColor"
        opacity="0.08"
      />
      {/* Inner spiral */}
      <path
        d="M80 55C80 55 65 60 62 72C59 84 70 88 80 80C90 88 101 84 98 72C95 60 80 55 80 55Z"
        fill="currentColor"
        opacity="0.12"
      />
      <circle cx="80" cy="80" r="8" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Centre flower */}
      <circle cx="200" cy="20" r="6" fill="currentColor" opacity="0.2" />
      <ellipse cx="200" cy="8" rx="5" ry="10" fill="currentColor" opacity="0.12" />
      <ellipse cx="200" cy="32" rx="5" ry="10" fill="currentColor" opacity="0.12" />
      <ellipse cx="188" cy="20" rx="10" ry="5" fill="currentColor" opacity="0.12" />
      <ellipse cx="212" cy="20" rx="10" ry="5" fill="currentColor" opacity="0.12" />
      {/* Lines out */}
      <line x1="230" y1="20" x2="380" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="20" y1="20" x2="170" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* Small leaves on lines */}
      <ellipse cx="280" cy="20" rx="8" ry="4" fill="currentColor" opacity="0.08" transform="rotate(-20 280 20)" />
      <ellipse cx="340" cy="20" rx="6" ry="3" fill="currentColor" opacity="0.08" transform="rotate(15 340 20)" />
      <ellipse cx="120" cy="20" rx="8" ry="4" fill="currentColor" opacity="0.08" transform="rotate(20 120 20)" />
      <ellipse cx="60" cy="20" rx="6" ry="3" fill="currentColor" opacity="0.08" transform="rotate(-15 60 20)" />
    </svg>
  );
}
