"use client";
import React, { useState, useRef, useEffect } from "react";
import { Zap, Play, ArrowRight, ShieldCheck, Globe, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

// --- STRICT YOUTUBE TYPES ---
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  destroy(): void;
}

interface YTEvent {
  target: YTPlayer;
  data: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (id: string, options: object) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// --- DATA INTERFACES ---
interface HeroData {
  badge: string;
  mainTitle: string;
  subTitle: string;
  sloganBn: string;
  taglineBn: string;
  description: string;
  youtubeId: string;
}

interface VideoPlayerProps {
  youtubeId: string;
}

// --- VIDEO PLAYER COMPONENT ---
function VideoPlayer({ youtubeId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT) return;
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: (event: YTEvent) => {
            event.target.setVolume(volume * 100);
            if (isMuted) event.target.mute();
          },
          onStateChange: (event: YTEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, [youtubeId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume * 100);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume * 100);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };


  return (
    <div 
      ref={containerRef} 
      className="relative w-full group" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative w-full pb-[56.25%] bg-[#160B21] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(123,57,237,0.2)] transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_100px_rgba(123,57,237,0.3)] border border-[rgba(123,57,237,0.3)]">
        <div id="youtube-player" className="absolute top-0 left-0 w-full h-full" />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/50" 
            onClick={togglePlay}
          >
            <div className="w-[100px] h-[100px] bg-gradient-to-br from-[#7B39ED] to-[#9D5CFF] rounded-full flex items-center justify-center shadow-[0_8px_40px_rgba(123,57,237,0.6),0_0_60px_rgba(123,57,237,0.4)] transition-transform duration-300 hover:scale-110 border-2 border-[rgba(250,204,21,0.5)] animate-pulse-glow">
              <Play size={48} fill="white" className="text-white ml-1" />
            </div>
          </div>
        )}

        {/* Video Label */}
        <div className={`absolute top-6 left-6 bg-[rgba(22,11,33,0.95)] backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium z-[3] border border-[rgba(123,57,237,0.3)] shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <Zap size={16} className="text-[#FACC15]" />
          <span>3ZF Economic Model</span>
        </div>

        {/* Custom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex items-center gap-4 z-20 transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <button 
            onClick={togglePlay} 
            className="bg-transparent border-0 text-white cursor-pointer p-2 flex items-center justify-center transition-all duration-200 opacity-90 hover:opacity-100 hover:scale-110 hover:text-[#FACC15]"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={toggleMute} 
            className="bg-transparent border-0 text-white cursor-pointer p-2 flex items-center justify-center transition-all duration-200 opacity-90 hover:opacity-100 hover:scale-110 hover:text-[#FACC15]"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-[100px] h-1 bg-white/30 rounded-full outline-none cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          />
          
          <div className="flex-1" />
          
          <button 
            onClick={toggleFullscreen} 
            className="bg-transparent border-0 text-white cursor-pointer p-2 flex items-center justify-center transition-all duration-200 opacity-90 hover:opacity-100 hover:scale-110 hover:text-[#FACC15]"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>

        {/* Decorative Brackets */}
        <div className="absolute -top-2 -left-2 w-[30px] h-[30px] border-2 border-[#FACC15] opacity-60 border-r-0 border-b-0 animate-bracket-pulse"></div>
        <div className="absolute -top-2 -right-2 w-[30px] h-[30px] border-2 border-[#FACC15] opacity-60 border-l-0 border-b-0 animate-bracket-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-[30px] h-[30px] border-2 border-[#FACC15] opacity-60 border-r-0 border-t-0 animate-bracket-pulse"></div>
        <div className="absolute -bottom-2 -right-2 w-[30px] h-[30px] border-2 border-[#FACC15] opacity-60 border-l-0 border-t-0 animate-bracket-pulse"></div>
      </div>
    </div>
  );
}

// --- MAIN HERO COMPONENT ---
export default function ModernHomeHero() {
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/hero.json');
        const json = await response.json();
        // Simulation of stringify cycle to ensure serializability
        const cleanData = JSON.parse(JSON.stringify(json)) as HeroData;
        setData(cleanData);
      } catch (error) {
        console.error("Failed to load hero data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="min-h-screen bg-[#0B0114] flex items-center justify-center text-[#7B39ED] font-bold">LOADING 3ZF...</div>;


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes bracketPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 8px 40px rgba(123, 57, 237, 0.6), 0 0 60px rgba(123, 57, 237, 0.4);
          }
          50% { 
            box-shadow: 0 8px 50px rgba(123, 57, 237, 0.8), 0 0 80px rgba(123, 57, 237, 0.6);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float 15s ease-in-out infinite reverse;
        }

        .animate-slide-in-left {
          animation: slideInLeft 1s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 1s ease-out;
        }

        .animate-pulse-badge {
          animation: pulseBadge 2s ease-in-out infinite;
        }

        .animate-bracket-pulse {
          animation: bracketPulse 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .animate-fade-in-up-1 { animation: fadeInUp 0.8s ease-out 0.2s both; }
        .animate-fade-in-up-2 { animation: fadeInUp 0.8s ease-out 0.4s both; }
        .animate-fade-in-up-3 { animation: fadeInUp 0.8s ease-out 0.6s both; }
        .animate-fade-in-up-4 { animation: fadeInUp 0.8s ease-out 0.8s both; }
        .animate-fade-in-up-5 { animation: fadeInUp 0.8s ease-out 1s both; }
        .animate-fade-in-up-6 { animation: fadeInUp 0.8s ease-out 1.2s both; }
        .animate-fade-in-up-7 { animation: fadeInUp 0.8s ease-out 1.4s both; }
        .animate-fade-in-up-8 { animation: fadeInUp 0.8s ease-out 1.6s both; }

        .btn-ripple {
          position: relative;
          overflow: hidden;
        }

        .btn-ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-ripple:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>

      <section className="min-h-screen bg-[#0B0114] relative overflow-hidden p-4 sm:p-8">
        {/* Animated Background Glows */}
        <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(123,57,237,0.15)_0%,transparent_70%)] rounded-full -top-[200px] -left-[200px] blur-[80px] animate-float pointer-events-none"></div>
        <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(250,204,21,0.1)_0%,transparent_70%)] rounded-full -bottom-[150px] -right-[150px] blur-[100px] animate-float-reverse pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-4rem)] py-8 lg:py-0">
            
            {/* Left Column - Content */}
            <div className="animate-slide-in-left text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-br from-[#7B39ED] to-[#9D5CFF] text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide mb-2 animate-pulse-badge shadow-[0_4px_20px_rgba(123,57,237,0.4),0_0_40px_rgba(123,57,237,0.2)] border border-[rgba(123,57,237,0.3)]">
                <Zap size={16} className="text-[#FACC15]" />
                <span>{data.badge}</span>
              </div>

              {/* Main Title */}
              <h1 className="font-['Playfair_Display'] text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[4rem] font-black leading-[1.1] text-white">
                <span className="block text-[#FACC15] animate-fade-in-up-1 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                  {data.mainTitle.split(' ')[0]}
                </span>
                <span className="block animate-fade-in-up-2">
                  {data.mainTitle.split(' ').slice(1).join(' ')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-white/40 font-light animate-fade-in-up-3">
                {data.subTitle}
              </p>

              {/* Slogan Pills */}
              <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-up-4 justify-center lg:justify-start">
                {data.sloganBn.split(' • ').map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#160B21] px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-[rgba(123,57,237,0.2)] text-sm sm:text-base font-medium text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:transform hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(123,57,237,0.4)] hover:border-[#7B39ED] hover:bg-[rgba(123,57,237,0.1)] cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-[#FACC15] font-medium italic animate-fade-in-up-5">
                {data.taglineBn}
              </p>

              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed text-white/40 max-w-[600px] animate-fade-in-up-6 mx-auto lg:mx-0">
                {data.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-7 justify-center lg:justify-start pt-2">
                <button className="btn-ripple inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-br from-[#FACC15] to-[#FCD34D] text-[#0B0114] shadow-[0_4px_20px_rgba(250,204,21,0.4),0_0_40px_rgba(250,204,21,0.2)] transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(250,204,21,0.6),0_0_60px_rgba(250,204,21,0.3)]">
                  <span className="relative z-10">Join Community</span>
                  <ArrowRight size={20} className="relative z-10" />
                </button>
                
                <button className="btn-ripple inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold bg-[#160B21] text-white border-2 border-[#7B39ED] transition-all duration-300 hover:bg-[#7B39ED] hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(123,57,237,0.4)]">
                  <span className="relative z-10">Learn More</span>
                </button>
              </div>

            </div>

            {/* Right Column - Video */}
            <div className="animate-slide-in-right space-y-6">
              <VideoPlayer youtubeId={data.youtubeId} />
              
              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 animate-fade-in-up-8 justify-center lg:justify-start items-center sm:items-start">
                <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                  <ShieldCheck size={20} className="text-[#7B39ED]" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                  <Globe size={20} className="text-[#7B39ED]" />
                  <span>Global Impact</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}