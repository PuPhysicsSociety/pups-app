'use client';

import React, { useEffect, useState } from 'react';

export default function PhysicsBackground() {
  const [isDark, setIsDark] = useState(true);
  const [equationPositions, setEquationPositions] = useState<any[]>([]);
  const [gridBoxes, setGridBoxes] = useState<any[]>([]);

  useEffect(() => {
    // Theme detection
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const equations = [
    'E = mc²', '∇·E = ρ/ε₀', '∇×B = μ₀J + μ₀ε₀∂E/∂t',
    'ℏω = E₂ - E₁', 'F = ma', 'S = k ln W', 'Ψ = Ae^i(kx-ωt)',
    '∇²φ = 4πGρ', 'pV = nRT', 'ΔS ≥ 0', 'λ = h/p', 'L = T - V',
    'iℏ∂Ψ/∂t = ĤΨ', 'G = H - TS', '∮E·dl = -dΦ/dt',
    'Rμν - ½Rgμν = 8πGTμν', 'd²x/dt² + ω²x = 0', 'F = q(E + v×B)',
    'ΔxΔp ≥ ℏ/2', 'c² = 1/μ₀ε₀', '∇×E = -∂B/∂t', 'P = IV',
    'τ = r×F', 'v = fλ', 'Q = mcΔT', 'U = ½kx²', 'ω = √(k/m)',
    'n₁sinθ₁ = n₂sinθ₂', 'v² = u² + 2as', 'I = I₀e^(-μx)',
  ];

  useEffect(() => {
    const positions = equations.map(() => ({
      x: Math.random() * 90 + 2,
      y: Math.random() * 90 + 2,
      rotation: Math.random() * 30 - 15,
      size: 0.75 + Math.random() * 0.45,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    }));
    setEquationPositions(positions);

    const boxes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 90,
      y: Math.random() * 90,
      size: 60 + Math.random() * 100,
      rotation: Math.random() * 360,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 10,
    }));
    setGridBoxes(boxes);
  }, []);

  const opacity = isDark ? 0.4 : 0.3;
  const color = isDark ? '#ffffff' : '#000000';

  if (equationPositions.length === 0 || gridBoxes.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg, transparent, transparent 100px,
              ${color}25 100px, ${color}25 101px
            ),
            repeating-linear-gradient(
              90deg, transparent, transparent 100px,
              ${color}25 100px, ${color}25 101px
            )
          `
        }}
      />

      {/* Floating grid boxes */}
      <div className="absolute inset-0">
        {gridBoxes.map((box) => (
          <div
            key={box.id}
            className="absolute float-box"
            style={{
              '--rotation': `${box.rotation}deg`,
              '--duration': `${box.duration}s`,
              '--delay': `${box.delay}s`,
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.size}px`,
              height: `${box.size}px`,
              opacity: isDark ? 0.08 : 0.12,
              border: `1px solid ${color}`,
              borderRadius: '4px',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Physics equations */}
      <div className="absolute inset-0">
        {equations.map((equation, index) => {
          const pos = equationPositions[index];
          return (
            <div
              key={index}
              className="absolute float-equation font-mono whitespace-nowrap select-none"
              style={{
                '--rotation': `${pos.rotation}deg`,
                '--duration': `${pos.duration}s`,
                '--delay': `${pos.delay}s`,
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity,
                color,
                fontSize: `${pos.size}rem`,
              } as React.CSSProperties}
            >
              {equation}
            </div>
          );
        })}
      </div>

      {/* Static keyframes using CSS variables */}
      <style jsx>{`
        @keyframes floatBox {
          0%, 100% { transform: translate(0,0) rotate(var(--rotation)); }
          25% { transform: translate(20px,-30px) rotate(calc(var(--rotation) + 5deg)); }
          50% { transform: translate(-15px,-50px) rotate(calc(var(--rotation) - 5deg)); }
          75% { transform: translate(-25px,-20px) rotate(calc(var(--rotation) + 3deg)); }
        }
        .float-box {
          animation: floatBox var(--duration) ease-in-out var(--delay) infinite;
        }

        @keyframes floatEquation {
          0%, 100% { transform: translate(0,0) rotate(var(--rotation)); }
          33% { transform: translate(15px,-20px) rotate(calc(var(--rotation) + 3deg)); }
          66% { transform: translate(-10px,-35px) rotate(calc(var(--rotation) - 3deg)); }
        }
        .float-equation {
          animation: floatEquation var(--duration) ease-in-out var(--delay) infinite;
        }
      `}</style>
    </div>
  );
}
