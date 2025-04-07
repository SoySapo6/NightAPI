import { useEffect, useRef } from 'react';
import { useStarryBackground } from '@/hooks/useStarryBackground';

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initStars, animateStars } = useStarryBackground();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars(canvas);
      }
    };
    
    // Initialize
    handleResize();
    
    // Set up animation
    const animationId = animateStars(canvas);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [initStars, animateStars]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #020617 0%, #0f172a 100%)' }}
    />
  );
};

export default StarryBackground;
