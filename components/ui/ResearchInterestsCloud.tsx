import React from 'react';

interface WordData {
  text: string;
  size: number;
}

const researchAreas: WordData[] = [
  { text: 'Quantum Mechanics', size: 9 },
  { text: 'Gravitation', size: 9 },
  { text: 'Particle Physics', size: 8 },
  { text: 'Cosmology', size: 8 },
  { text: 'Classical Mechanics', size: 7 },
  { text: 'Electromagnetism', size: 7 },
  { text: 'Thermodynamics', size: 6 },
  { text: 'Astrophysics', size: 6 },
  { text: 'Optics', size: 6 },
  { text: 'Quantum Field Theory', size: 7 },
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

const shuffleArray = (arr: WordData[]) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generatePositions = (words: WordData[], width: number, height: number) => {
  return words.map((word, index) => {
    const seed = index;
    const x = (seed * 137.5) % width;
    const y = (seed * 73) % height;
    return { ...word, x, y };
  });
};

export default function ResearchInterestsCloud() {
  const width = 600;
  const height = 400;
  
  // This locks down the visual generation layout on component mount
  const positioned = React.useMemo(() => {
    const shuffled = shuffleArray(researchAreas);
    return generatePositions(shuffled, width, height);
  }, []);

  const getColor = (size: number) => {
    if (size >= 9) return '#a07a36';
    if (size >= 7) return '#b8893d';
    if (size >= 5) return '#c9964a';
    return '#d4a574';
  };

  const getFontSize = (size: number) => {
    return 14 + size * 3;
  };

  return (
    <div style={{ 
      position: 'fixed',       // Keeps it glued to the screen during scrolling
      top: '50%',              // Centers container vertically
      left: '50%',             // Centers container horizontally
      transform: 'translate(-50%, -50%)', // Offsets layout alignment for true center
      width: '100vw', 
      height: '100vh',
      zIndex: 0,               // Keeps it strictly behind foreground elements
      overflow: 'hidden', 
      pointerEvents: 'none',   // Prevents blocking clicks/text highlights
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.12            // Slight reduction in visibility for crisp contrast
    }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ maxWidth: "800px", maxHeight: "800px" }}
      >
        {positioned.map((item, i) => {
          const fontSize = getFontSize(item.size);
          const color = getColor(item.size);

          return (
            <g key={i} transform={`translate(${item.x},${item.y})`}>
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
