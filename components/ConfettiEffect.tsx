import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  originX?: number; 
  originY?: number;
}

export function ConfettiEffect({ 
  active, 
  duration = 3000, 
  originX = 0.5, 
  originY = 0.5 
}: ConfettiEffectProps) {
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000 
  });
  const [isActive, setIsActive] = useState(false);
  
  const hackClubColors = [
    '#ec3750',
    '#ff8c37',
    '#f1c40f',
    '#1abc9c',
    '#3498db',
    '#8067c3',
    '#6a4c93'
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    if (!active) {
      setIsActive(false);
      return;
    }
    
    setIsActive(true);
    
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!isActive) return null;

  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        recycle={false}
        numberOfPieces={100}
        tweenDuration={1500}
        gravity={0.25}
        wind={0.01}
        colors={hackClubColors}
        confettiSource={{
          x: dimensions.width * originX,
          y: dimensions.height * originY,
          w: 0,
          h: 0
        }}
        initialVelocityX={3}
        initialVelocityY={10}
        friction={0.15}
        opacity={0.9}
      />
    </div>
  );
}
