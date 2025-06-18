"use client";

import React, { useEffect } from "react";

export const Loading = ({ text = "Hackagram" }: { text?: string }) => {
  useEffect(() => {
    addWaveAnimation();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex space-x-2 mb-4">
        {text.split("").map((char, index) => (
          <span 
            key={`${char}-${index}`} 
            className="text-[#ec3750] font-bold text-4xl animate-wave-text"
            style={{ 
              animationDelay: `${index * 0.08}s`,
              display: "inline-block"
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

const addWaveAnimation = () => {
  if (typeof document !== "undefined") {
    const existingStyle = document.getElementById('wave-animations');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = 'wave-animations';
    style.textContent = `
      @keyframes wave-text {
        0%, 100% {
          transform: translateY(0);
          opacity: 1;
        }
        25% {
          transform: translateY(-15px);
          opacity: 0.8;
        }
        50% {
          transform: translateY(0);
          opacity: 1;
        }
        75% {
          transform: translateY(6px);
          opacity: 0.9;
        }
      }
      
      .animate-wave-text {
        animation: wave-text 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
};

if (typeof window !== "undefined") {
  addWaveAnimation();
}