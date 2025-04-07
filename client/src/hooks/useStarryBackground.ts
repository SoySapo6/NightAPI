import { useCallback, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const useStarryBackground = () => {
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);

  const initStars = useCallback((canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const starCount = Math.floor((width * height) / 2000); // Adjust density as needed
    
    const stars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() < 0.9 ? Math.random() * 1.5 + 0.5 : Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    starsRef.current = stars;
  }, []);

  const animateStars = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      starsRef.current.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const currentOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return animationFrameRef.current;
  }, []);

  return { initStars, animateStars };
};
