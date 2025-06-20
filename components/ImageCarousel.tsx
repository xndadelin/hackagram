import { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  onImageDoubleClick?: () => void;
  showLikeAnimation?: boolean;
  aspectRatio?: "square" | "portrait" | "landscape";
  cropMode?: "cover" | "contain";
}

export function ImageCarousel({ 
  images, 
  onImageDoubleClick,
  showLikeAnimation = false,
  aspectRatio = "square",
  cropMode = "cover"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getAspectRatioClass = () => {
    switch(aspectRatio) {
      case "portrait": return "aspect-[4/5]"; 
      case "landscape": return "aspect-[1.91/1]";
      default: return "aspect-square"; 
    }
  };
  
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  
  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  if (!images || images.length === 0) {
    return (
      <div className={`w-full ${getAspectRatioClass()} bg-muted flex items-center justify-center`}>
        <img
          src="https://assets.hackclub.com/flag-standalone.svg"
          alt="Placeholder"
          className="h-32 w-32 p-4"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${getAspectRatioClass()}`}>
      <div className="w-full h-full overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className={`w-full h-full object-${cropMode}`}
          onDoubleClick={() => {
            if (onImageDoubleClick) {
              onImageDoubleClick();
            }
          }}
          onError={(e) => {
            e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
            e.currentTarget.className = "h-32 w-32 p-4";
          }}
        />
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
            <div className="px-2 py-1 bg-background/40 rounded-full">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1}/{images.length}
              </span>
            </div>
          </div>
        </>
      )}
      
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart 
            fill="#ec3750" 
            stroke="#ec3750" 
            size={80} 
            className="animate-scale-up text-[#ec3750]" 
          />
        </div>
      )}
    </div>
  );
}
