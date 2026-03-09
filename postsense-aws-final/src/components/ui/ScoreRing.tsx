import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({ score, size = 160, strokeWidth = 10, label, className = "" }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getGradientId = () => `score-gradient-${score}-${size}`;

  const getColors = (s: number): [string, string] => {
    if (s >= 70) return ["#22c55e", "#10b981"];
    if (s >= 40) return ["#eab308", "#f59e0b"];
    return ["#ef4444", "#f97316"];
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 150);
    return () => clearTimeout(timer);
  }, [score]);

  const [c1, c2] = getColors(animatedScore);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <div 
        className="absolute rounded-full"
        style={{
          width: size + 16,
          height: size + 16,
          background: `radial-gradient(circle, ${c1}10 0%, transparent 70%)`,
        }}
      />
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Track dots */}
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2 - Math.PI / 2;
          const x = size / 2 + (radius) * Math.cos(angle);
          const y = size / 2 + (radius) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1}
              fill="hsl(var(--border))"
              opacity={0.2}
            />
          );
        })}
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 12px ${c1}60)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span 
          className="font-heading font-bold"
          style={{ 
            fontSize: size * 0.22,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {Math.round(animatedScore)}
        </motion.span>
        {label && <span className="text-xs text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
