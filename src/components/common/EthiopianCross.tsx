import React from 'react';

interface EthiopianCrossProps {
  className?: string;
  size?: number;
  color?: string;
}

export const EthiopianCross: React.FC<EthiopianCrossProps> = ({
  className = '',
  size = 28,
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ethiopian Orthodox Cross"
    >
      {/* Central Cross Pillar & Beam */}
      <rect x="44" y="10" width="12" height="80" rx="2" fill={color} />
      <rect x="15" y="38" width="70" height="12" rx="2" fill={color} />

      {/* Top Finial & Trefoils */}
      <circle cx="50" cy="10" r="5" fill={color} />
      <path
        d="M40 22 C40 16 50 14 50 14 C50 14 60 16 60 22 C60 26 50 28 50 28 C50 28 40 26 40 22 Z"
        fill={color}
      />

      {/* Lateral Cross Arm Finials */}
      <circle cx="15" cy="44" r="5" fill={color} />
      <circle cx="85" cy="44" r="5" fill={color} />
      <circle cx="50" cy="90" r="4" fill={color} />

      {/* Ornate Ethiopian Interlocking Quadrants */}
      {/* Top Left Quadrant Loop */}
      <path
        d="M32 26 C36 26 42 32 42 36 C42 42 34 42 30 38 C26 34 26 28 32 26 Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top Right Quadrant Loop */}
      <path
        d="M68 26 C64 26 58 32 58 36 C58 42 66 42 70 38 C74 34 74 28 68 26 Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom Left Quadrant Loop */}
      <path
        d="M32 62 C36 62 42 56 42 52 C42 46 34 46 30 50 C26 54 26 60 32 62 Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom Right Quadrant Loop */}
      <path
        d="M68 62 C64 62 58 56 58 52 C58 46 66 46 70 50 C74 54 74 60 68 62 Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center Heart Rhombus / Meskel Core */}
      <polygon
        points="50,34 60,44 50,54 40,44"
        fill={color}
      />
      <circle cx="50" cy="44" r="3" fill="#151311" />

      {/* Lower Stem Base Flairs */}
      <path
        d="M38 78 C42 74 46 72 50 72 C54 72 58 74 62 78"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
