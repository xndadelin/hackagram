import { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface HeartButtonProps {
  size?: number;
  initialState?: boolean;
  onToggle?: (isLiked: boolean) => void;
}

export function HeartButton({
  size = 24,
  initialState = false,
  onToggle
}: HeartButtonProps) {
  const [liked, setLiked] = useState(initialState);
  const [showConfetti, setShowConfetti] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(1);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLiked(!!initialState);
  }, [initialState]);

  const handleClick = (e: React.MouseEvent) => {
    const newLikedState = !liked;
    setLiked(newLikedState);

    if (newLikedState) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
      setOpacity(1);
      setShowConfetti(true);
    }

    if (onToggle) {
      onToggle(newLikedState);
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const fadeStartTimer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          setOpacity(prev => {
            const newOpacity = prev - 0.05;
            if (newOpacity <= 0) {
              clearInterval(fadeInterval);
              return 0;
            }
            return newOpacity;
          });
        }, 50);

        return () => clearInterval(fadeInterval);
      }, 1500);

      const hideTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => {
        clearTimeout(fadeStartTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showConfetti]);

  return (
    <>
      <div
        ref={buttonRef}
        onClick={handleClick}
        className="relative hover:scale-110 transition-transform duration-200 cursor-pointer"
      >
        <Heart
          fill={liked ? "#ec3750" : "none"}
          stroke={liked ? "#ec3750" : "currentColor"}
          size={size}
          className={`transition-all duration-300 ${liked ? "scale-110 text-[#ec3750]" : "scale-100"}`}
          data-liked={liked ? "true" : "false"}
        />
      </div>

      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100,
          opacity: opacity,
          transition: 'opacity 1.5s ease-out'
        }}>
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={150}
            tweenDuration={5000}
            gravity={0.25}
            confettiSource={{
              x: position.x,
              y: position.y,
              w: 10,
              h: 10
            }}
            initialVelocityY={-10}
            initialVelocityX={5}
            colors={['#ec3750', '#ff8c37', '#f1c40f', '#1abc9c', '#3498db', '#8067c3']}
          />
        </div>
      )}
    </>
  );
}
