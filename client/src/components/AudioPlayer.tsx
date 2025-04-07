import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => {
          console.error("Audio playback failed:", e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm border border-border">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full text-white hover:text-cyan-500 transition-colors"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>
      <audio ref={audioRef} loop preload="none">
        <source src="https://dl.dropboxusercontent.com/s/i3ocvaoymppj8x9/night-ambience.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
