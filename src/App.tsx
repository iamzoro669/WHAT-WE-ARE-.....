import React, { useState, useEffect, useRef } from 'react';

interface SectionContent {
  texts?: string[];
  buttonText?: string;
  subtext?: string;
  letter?: boolean;
  content?: string;
  voiceNote?: boolean;
  choices?: boolean;
}

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [showText, setShowText] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(0.05);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [displayedLetter, setDisplayedLetter] = useState('');
  const [voicePlaying, setVoicePlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const letterScrollRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  // Text content for each section
  const sectionContent: SectionContent[] = [
    {
      texts: ["hey ramen ji.", "don't overthink this.", "just stay for a minute."],
      buttonText: "continue"
    },
    {
      texts: ["i didn't planned anything...", "but somehow...", "you became my favorite person to talk to."],
      subtext: "it just happened."
    },
    {
      texts: ["those random calls...", "where nothing important is said...", "but it still feels like it matters."]
    },
    {
      letter: true,
      content: "ramen ji,\n\nI feel like I didn’t say things properly that time when you asked “what are we”...\nor maybe I just couldn’t express it the right way.\n\nI don’t know what you understood from it,\nbut what I actually meant is simple —\n\nI like you. Like, a lot.\n\nAnd it’s not just a casual kind of “like”...\nit’s something I can’t really ignore or hide.\n\nI genuinely enjoy talking to you,\nand somewhere along the way, you became important to me.\n\nI don’t want to overcomplicate this,\nand I’m not trying to force anything either.\n\nI just wanted to say it clearly this time —\n\nI really like you, and I enjoy being with you.\n\nWhat you feel… that’s completely your space,\nand I respect that.\n\nI just didn’t want to leave this unsaid anymore"
    },
    {
      texts: ["this is better said than written."],
      voiceNote: true
    },
    {
      texts: ["so yeah...", "what do you think?"],
      choices: true
    }
  ];

  // High performance dedicated mouse-follower glow
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (cursorGlowRef.current) {
            cursorGlowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typewriter effect for letter
  useEffect(() => {
    if (currentSection === 3) {
      let i = 0;
      const text = sectionContent[3].content || "";
      setDisplayedLetter('');
      const interval = setInterval(() => {
        setDisplayedLetter(text.slice(0, i + 1));
        i++;
        
        if (letterScrollRef.current) {
          letterScrollRef.current.scrollTop = letterScrollRef.current.scrollHeight;
        }

        if (i >= text.length) clearInterval(interval);
      }, 35);
      return () => clearInterval(interval);
    }
  }, [currentSection]);

  // Text animation timer
  useEffect(() => {
    if (currentSection === 0 || currentSection === 1 || currentSection === 2 || currentSection === 5) {
      const section = sectionContent[currentSection];
      if (section.texts && textIndex < section.texts.length - 1) {
        const timer = setTimeout(() => {
          setShowText(false);
          setTimeout(() => {
            setTextIndex(prev => prev + 1);
            setShowText(true);
          }, 300);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentSection, textIndex]);

  // Glow intensity based on section
  useEffect(() => {
    if (currentSection === 2) {
      setGlowIntensity(0.08);
      setMusicPlaying(true);
    } else if (currentSection === 3) {
      setGlowIntensity(0.1);
    } else if (currentSection === 5) {
      setGlowIntensity(0.12);
    } else {
      setGlowIntensity(0.05);
    }
  }, [currentSection]);

  // Audio playback for letter section
  useEffect(() => {
    if (currentSection >= 2 && audioRef.current) {
      audioRef.current.volume = 0.5;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log('Audio error:', e));
      }
    } else if (audioRef.current && currentSection < 2) {
      audioRef.current.pause();
      if (currentSection === 0) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentSection]);

  const toggleVoice = () => {
    if (voiceAudioRef.current) {
      if (voicePlaying) {
        voiceAudioRef.current.pause();
        if (audioRef.current && currentSection >= 2) {
          audioRef.current.play().catch(e => console.log(e));
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        voiceAudioRef.current.play().catch(e => console.log('Voice audio error:', e));
      }
      setVoicePlaying(!voicePlaying);
    }
  };

  const nextSection = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (currentSection === 4 && voicePlaying) {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      setVoicePlaying(false);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log(e));
      }
    }

    setTimeout(() => {
      setCurrentSection(prev => prev + 1);
      setTextIndex(0);
      setShowText(true);
      setIsTransitioning(false);
    }, 800);
  };

  const handleChoice = async (choice: string) => {
    setFinalChoice(choice);
    if (choice === 'yes') {
      setGlowIntensity(0.15);
    } else {
      setGlowIntensity(0.06);
    }

    try {
      const responseText = choice === 'yes' ? '♡ i like you too' : '✧ let\'s not rush';
      const time = new Date().toLocaleString();
      
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: "2c9e3720-3e90-4bb0-9cce-d145346f0012",
          subject: "New Response from Dreamy Web Experience",
          message: `The user selected: ${responseText}\nTime: ${time}`,
          from_name: "Web Experience Response"
        })
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };



  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#0a0a0f] font-sans"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pink glow from top left */}
        <div
          className="absolute rounded-full blur-[100px]"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #f8c8dc 0%, transparent 70%)',
            opacity: glowIntensity,
            top: '-100px',
            left: '-100px',
            transition: 'opacity 1.5s ease'
          }}
        />
        
        {/* Blue glow from bottom right */}
        <div
          className="absolute rounded-full blur-[100px]"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, #cfe8ff 0%, transparent 70%)',
            opacity: glowIntensity * 0.8,
            bottom: '-100px',
            right: '-100px',
            transition: 'opacity 1.5s ease'
          }}
        />
        
        {/* Lavender center glow */}
        <div
          className="absolute rounded-full blur-[80px]"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, #e8d5ff 0%, transparent 70%)',
            opacity: glowIntensity * 0.6,
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 1.5s ease'
          }}
        />

        {/* Secondary floating blob */}
        <div
          className="absolute rounded-full blur-[90px]"
          style={{
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, #f8c8dc 0%, #e8d5ff 50%, transparent 70%)',
            opacity: glowIntensity * 0.4,
            top: '20%',
            right: '20%',
            animation: 'float1 20s ease-in-out infinite',
            transition: 'opacity 1.5s ease'
          }}
        />

        {/* Third floating blob */}
        <div
          className="absolute rounded-full blur-[85px]"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, #cfe8ff 0%, #e8d5ff 50%, transparent 70%)',
            opacity: glowIntensity * 0.35,
            bottom: '30%',
            left: '15%',
            animation: 'float2 25s ease-in-out infinite reverse',
            transition: 'opacity 1.5s ease'
          }}
        />
      </div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Main content area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        
        {/* SECTION 1: INTRO */}
        {currentSection === 0 && (
          <div
            className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <div className="mb-16 h-32 flex items-center justify-center">
              <p
                className={`text-white/90 text-xl md:text-2xl font-light tracking-[0.15em] leading-relaxed transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ textShadow: '0 0 40px rgba(248,200,220,0.3)' }}
              >
                {sectionContent[0].texts?.[textIndex]}
              </p>
            </div>
            
            {textIndex >= (sectionContent[0].texts?.length || 0) - 1 && (
              <button
                onClick={nextSection}
                className="group relative mt-8 px-10 py-4 text-white/70 text-sm font-light tracking-[0.3em] transition-all duration-500 hover:text-white hover:scale-[1.02] mx-auto inline-flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50px'
                }}
              >
                <span>continue</span>
                <div
                  className="absolute inset-0 rounded-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: '0 0 30px rgba(248,200,220,0.2), 0 0 60px rgba(232,213,255,0.1)',
                  }}
                />
              </button>
            )}
          </div>
        )}

        {/* SECTION 2: CONNECTION */}
        {currentSection === 1 && (
          <div
            className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <div className="mb-12 h-32 flex items-center justify-center">
              <p
                className={`text-white/90 text-xl md:text-2xl font-light tracking-[0.15em] leading-relaxed transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ textShadow: '0 0 40px rgba(232,213,255,0.3)' }}
              >
                {sectionContent[1].texts?.[textIndex]}
              </p>
            </div>

            {textIndex >= (sectionContent[1].texts?.length || 0) - 1 && (
              <>
                <p className="text-white/30 text-sm font-light tracking-[0.2em] mb-12 transition-all duration-1000" style={{ animation: 'fadeIn 2s ease forwards' }}>
                  {sectionContent[1].subtext}
                </p>
                <button
                  onClick={nextSection}
                  className="group relative px-10 py-4 text-white/70 text-sm font-light tracking-[0.3em] transition-all duration-500 hover:text-white hover:scale-[1.02] mx-auto inline-flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50px'
                  }}
                >
                  <span>next</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* SECTION 3: MEMORY */}
        {currentSection === 2 && (
          <div
            className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <div className="mb-12 h-32 flex items-center justify-center">
              <p
                className={`text-white/90 text-xl md:text-2xl font-light tracking-[0.15em] leading-relaxed transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ textShadow: '0 0 40px rgba(207,232,255,0.3)' }}
              >
                {sectionContent[2].texts?.[textIndex]}
              </p>
            </div>

            {textIndex >= (sectionContent[2].texts?.length || 0) - 1 && (
              <>
                <p className="text-white/30 text-sm font-light tracking-[0.2em] mb-12 transition-all duration-1000">
                  {sectionContent[2].subtext}
                </p>
                <button
                  onClick={nextSection}
                  className="group relative px-10 py-4 text-white/70 text-sm font-light tracking-[0.3em] transition-all duration-500 hover:text-white hover:scale-[1.02] mx-auto inline-flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50px'
                  }}
                >
                  <span>read more</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* SECTION 4: LETTER */}
        {currentSection === 3 && (
          <div
            className={`w-full max-w-[450px] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <div
              ref={letterScrollRef}
              className="p-10 md:p-12 rounded-2xl mx-auto custom-scrollbar aspect-square flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 60px rgba(0,0,0,0.3), inset 0 0 40px rgba(248,200,220,0.05)',
                overflowY: 'auto'
              }}
            >
              <p
                className="text-white/80 text-sm md:text-base font-light leading-snug tracking-[0.05em] whitespace-pre-line text-left pl-4 md:pl-6"
                style={{ textShadow: '0 0 30px rgba(248,200,220,0.2)' }}
              >
                {displayedLetter}
                <span className="animate-pulse">|</span>
              </p>
              {displayedLetter.length === (sectionContent[3].content?.length || 0) && (
                <div className="text-center mt-8">
                  <span className="text-white/20 text-2xl">♡</span>
                </div>
              )}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={nextSection}
                className="group relative px-10 py-4 text-white/70 text-sm font-light tracking-[0.3em] transition-all duration-500 hover:text-white hover:scale-[1.02] mx-auto inline-flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50px'
                }}
              >
                <span>listen</span>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 5: VOICE NOTE */}
        {currentSection === 4 && (
          <div
            className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <p
              className="text-white/80 text-xl md:text-2xl font-light tracking-[0.15em] mb-16"
              style={{ textShadow: '0 0 40px rgba(207,232,255,0.3)' }}
            >
              {sectionContent[4].texts?.[0]}
            </p>

            <button
              onClick={toggleVoice}
              className="group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              <div
                className={`absolute inset-0 rounded-full ${voicePlaying ? 'animate-ping opacity-30' : 'animate-ping opacity-20'}`}
                style={{
                  background: 'radial-gradient(circle, rgba(248,200,220,0.4) 0%, transparent 70%)',
                  animationDuration: voicePlaying ? '1s' : '3s'
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 50px rgba(248,200,220,0.2), 0 0 100px rgba(232,213,255,0.1)'
                }}
              />
              {voicePlaying ? (
                <div className="flex gap-[6px] items-center h-8 z-10">
                  <div className="w-[4px] bg-white/90 rounded-full h-[24px] animate-[pulse-wave_1s_ease-in-out_infinite]" />
                  <div className="w-[4px] bg-white/90 rounded-full h-[14px] animate-[pulse-wave_1.2s_ease-in-out_infinite_0.1s]" />
                  <div className="w-[4px] bg-white/90 rounded-full h-[32px] animate-[pulse-wave_0.8s_ease-in-out_infinite_0.2s]" />
                  <div className="w-[4px] bg-white/90 rounded-full h-[18px] animate-[pulse-wave_1.1s_ease-in-out_infinite_0.3s]" />
                  <div className="w-[4px] bg-white/90 rounded-full h-[28px] animate-[pulse-wave_0.9s_ease-in-out_infinite_0.4s]" />
                </div>
              ) : (
                <svg className="w-12 h-12 text-white/70 group-hover:text-white/90 transition-colors duration-300 ml-1 z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <p className="text-white/30 text-sm font-light tracking-[0.2em] mt-10 mb-12">
              {voicePlaying ? 'playing...' : 'tap to play'}
            </p>

            <button 
              onClick={nextSection} 
              className="text-white/30 hover:text-white/70 text-xs tracking-[0.2em] transition-colors mt-6 mb-8"
            >
              continue →
            </button>
          </div>
        )}

        {/* SECTION 6: FINAL */}
        {currentSection === 5 && !finalChoice && (
          <div
            className={`text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning ? 'opacity-0 blur-sm scale-[0.96]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <div className="mb-12 h-28 flex items-center justify-center">
              <p
                className={`text-white/90 text-2xl md:text-3xl font-light tracking-[0.2em] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ textShadow: '0 0 50px rgba(248,200,220,0.4)' }}
              >
                {sectionContent[5].texts?.[textIndex]}
              </p>
            </div>

            {textIndex >= (sectionContent[5].texts?.length || 0) - 1 && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
                <button
                  onClick={() => handleChoice('yes')}
                  className="group relative px-12 py-5 text-white/80 text-sm font-light tracking-[0.2em] transition-all duration-500 hover:text-white hover:scale-[1.03] mx-auto inline-flex items-center justify-center"
                  style={{
                    background: 'rgba(248,200,220,0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(248,200,220,0.3)',
                    borderRadius: '50px'
                  }}
                >
                  <span>♡ i like you too</span>
                  <div
                    className="absolute inset-0 rounded-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: '0 0 40px rgba(248,200,220,0.3), inset 0 0 20px rgba(248,200,220,0.1)'
                    }}
                  />
                </button>

                <button
                  onClick={() => handleChoice('no')}
                  className="group relative px-12 py-5 text-white/60 text-sm font-light tracking-[0.2em] transition-all duration-500 hover:text-white/90 hover:scale-[1.03] mx-auto inline-flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50px'
                  }}
                >
                  <span>✧ let's not rush</span>
                  <div
                    className="absolute inset-0 rounded-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: '0 0 40px rgba(207,232,255,0.2), inset 0 0 20px rgba(207,232,255,0.1)'
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* END STATES */}
        {currentSection === 5 && finalChoice && (
          <div
            className="text-center transition-all duration-1500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ animation: 'fadeIn 2s ease' }}
          >
            {finalChoice === 'yes' ? (
              <>
                <div className="mb-8">
                  <span className="text-6xl" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>💓</span>
                </div>
                <p
                  className="text-white/90 text-3xl md:text-4xl font-light tracking-[0.2em] mb-6"
                  style={{ textShadow: '0 0 60px rgba(248,200,220,0.5)' }}
                >
                  that was enough for me.
                </p>
                <p
                  className="text-white/40 text-lg font-light tracking-[0.15em] mb-12"
                >
                  you make my heart feel light
                </p>
                <div className="flex gap-4 justify-center">
                  <span className="text-2xl" style={{ animation: 'float1 2s ease-in-out infinite' }}>✨</span>
                  <span className="text-2xl" style={{ animation: 'float1 2s ease-in-out infinite 0.3s' }}>💫</span>
                  <span className="text-2xl" style={{ animation: 'float1 2s ease-in-out infinite 0.6s' }}>💕</span>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <span className="text-6xl opacity-60">🌙</span>
                </div>
                <p
                  className="text-white/70 text-2xl md:text-3xl font-light tracking-[0.2em] mb-6"
                  style={{ textShadow: '0 0 40px rgba(207,232,255,0.3)' }}
                >
                  that's okay.
                </p>
                <p
                  className="text-white/50 text-xl font-light tracking-[0.15em] mb-4"
                >
                  i meant what i said.
                </p>
                <p
                  className="text-white/30 text-base font-light tracking-[0.1em] mb-12"
                >
                  you're still my favorite person.
                </p>
                <div className="flex gap-4 justify-center">
                  <span className="text-2xl opacity-50">💙</span>
                  <span className="text-2xl opacity-50">✨</span>
                  <span className="text-2xl opacity-50">🌌</span>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* Music indicator */}
      {musicPlaying && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 text-white/30 text-xs tracking-wider">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-white/30 rounded-full" style={{ animation: 'musicBar 0.8s ease-in-out infinite' }}></span>
              <span className="w-1 h-3 bg-white/30 rounded-full" style={{ animation: 'musicBar 0.8s ease-in-out infinite 0.2s' }}></span>
              <span className="w-1 h-5 bg-white/30 rounded-full" style={{ animation: 'musicBar 0.8s ease-in-out infinite 0.4s' }}></span>
              <span className="w-1 h-4 bg-white/30 rounded-full" style={{ animation: 'musicBar 0.8s ease-in-out infinite 0.6s' }}></span>
            </div>
            <span>ambient sounds</span>
          </div>
        </div>
      )}

      {/* Cursor glow effect */}
      <div
        ref={cursorGlowRef}
        className="fixed pointer-events-none z-50 rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(248,200,220,0.12) 0%, rgba(232,213,255,0.08) 30%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          mixBlendMode: 'screen',
          willChange: 'transform',
          transition: 'transform 0.35s ease-out'
        }}
      />

      {/* Ambient particle effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${15 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Background audio */}
      <audio ref={audioRef} src="/GULABO .wav" loop />
      
      {/* Voice audio */}
      <audio 
        ref={voiceAudioRef} 
        src="/my voice .mp3" 
        onEnded={() => {
          setVoicePlaying(false);
          if (audioRef.current && currentSection >= 2) {
            audioRef.current.play().catch(e => console.log(e));
          }
        }} 
      />

      {/* Custom styles */}
      <style>{`
        @keyframes pulse-wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 20px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.92); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(248,200,220,0.3)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 40px rgba(248,200,220,0.5)); transform: scale(1.05); }
        }
        
        @keyframes musicBar {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          50% { 
            transform: translateY(-100px) translateX(50px);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #0a0a0f;
          overflow-x: hidden;
        }
        
        * {
          box-sizing: border-box;
        }
        
        ::selection {
          background: rgba(248,200,220,0.3);
          color: white;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
