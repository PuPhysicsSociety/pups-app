import React from 'react';

interface WordData {
  text: string;
  size: number; // relative size 1-10
}

const researchAreas: WordData[] = [
  // Primary areas
  { text: 'Quantum Mechanics', size: 9 },
  { text: 'Gravitation', size: 9 },
  { text: 'Particle Physics', size: 8 },
  { text: 'Cosmology', size: 8 },
  { text: 'Classical Mechanics', size: 7 },
  
  // Secondary areas
  { text: 'Electromagnetism', size: 7 },
  { text: 'Thermodynamics', size: 6 },
  { text: 'Astrophysics', size: 6 },
  { text: 'Optics', size: 6 },
  { text: 'Quantum Field Theory', size: 7 },
  
  // Tertiary areas
  { text: 'Matter', size: 5 },
  { text: 'Energy', size: 5 },
  { text: 'Condensed Matter', size: 5 },
  { text: 'Nuclear Physics', size: 6 },
  { text: 'Fluid Dynamics', size: 5 },
  { text: 'Wave Mechanics', size: 4 },
  { text: 'Relativity', size: 5 },
  { text: 'High Energy Physics', size: 5 },
  { text: 'Statistical Physics', size: 4 },
  { text: 'Electronics', size: 3 },
];

// Shuffle array for random positioning
const shuffleArray = (arr: WordData[]) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate random positions in SVG space
const generatePositions = (words: WordData[], width: number, height: number) => {
  return words.map((word, index) => {
    const seed = index;
    const x = (seed * 137.5) % width; // Use golden angle for distribution
    const y = (seed * 73) % height;
    return { ...word, x, y };
  });
};

export default function ResearchInterestsCloud() {
  const width = 600;
  const height = 400;
  const shuffled = shuffleArray(researchAreas);
  const positioned = generatePositions(shuffled, width, height);

  const getColor = (size: number) => {
    // Gradient from lighter gold to darker gold, matching PUPS brand
    if (size >= 9) return '#a07a36'; // Dark gold
    if (size >= 7) return '#b8893d'; // Medium gold
    if (size >= 5) return '#c9964a'; // Light gold
    return '#d4a574'; // Lighter gold
  };

  const getFontSize = (size: number) => {
    return 14 + size * 3; // Sizes from 17px to 44px
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        maxWidth="600px"
        style={{
          border: `1px solid rgba(26,23,16,.13)`,
          background: '#f5efe0',
          borderRadius: '2px',
        }}
      >
        {/* Background accent */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5efe0" />
            <stop offset="100%" stopColor="#ede4cf" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGradient)" />

        {/* Word cloud */}
        {positioned.map((item, i) => {
          const fontSize = getFontSize(item.size);
          const color = getColor(item.size);
          const opacity = 0.7 + (item.size / 10) * 0.3; // Opacity based on size

          return (
            <g
              key={i}
              transform={`translate(${item.x},${item.y})`}
              style={{ cursor: 'default' }}
            >
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: item.size >= 8 ? 500 : 400,
                  fill: color,
                  opacity: opacity,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.text}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
