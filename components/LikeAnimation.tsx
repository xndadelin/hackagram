import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeAnimationProps {
  show: boolean;
}

export function LikeAnimation({ show }: LikeAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setOpacity(1);
      
      const fadeTimer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          setOpacity(prev => {
            const newOpacity = prev - 0.1;
            if (newOpacity <= 0) {
              clearInterval(fadeInterval);
              return 0;
            }
            return newOpacity;
          });
        }, 30);
        
        return () => clearInterval(fadeInterval);
      }, 300);
      
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 900);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <Heart 
        fill="#ec3750" 
        stroke="#ec3750" 
        size={80} 
        className="animate-scale-up text-[#ec3750]" 
      />
    </div>
  );
}
