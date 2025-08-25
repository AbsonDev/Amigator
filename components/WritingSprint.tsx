import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, FireIcon, TrophyIcon } from './Icons';

interface WritingSprintProps {
  initialText: string;
  onTextChange: (text: string) => void;
  onComplete?: (stats: SprintStats) => void;
}

interface SprintStats {
  wordsWritten: number;
  timeElapsed: number;
  wpm: number;
  streak: number;
  achievement?: string;
}

const WritingSprint: React.FC<WritingSprintProps> = ({ 
  initialText, 
  onTextChange,
  onComplete 
}) => {
  // Sprint settings
  const [sprintDuration, setSprintDuration] = useState(25); // minutes
  const [wordGoal, setWordGoal] = useState(500);
  const [dangerMode, setDangerMode] = useState(false);
  
  // Sprint state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(sprintDuration * 60);
  const [text, setText] = useState(initialText);
  const [startWordCount, setStartWordCount] = useState(0);
  const [lastTypedTime, setLastTypedTime] = useState(Date.now());
  const [dangerLevel, setDangerLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dangerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate current word count
  const getWordCount = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const currentWordCount = getWordCount(text);
  const wordsWritten = currentWordCount - startWordCount;
  const progress = (wordsWritten / wordGoal) * 100;
  const wpm = timeLeft < sprintDuration * 60 - 60 
    ? Math.round(wordsWritten / ((sprintDuration * 60 - timeLeft) / 60))
    : 0;

  // Start sprint
  const startSprint = () => {
    setIsActive(true);
    setIsPaused(false);
    setStartWordCount(getWordCount(text));
    setTimeLeft(sprintDuration * 60);
    setLastTypedTime(Date.now());
    textareaRef.current?.focus();
  };

  // Pause/Resume sprint
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      textareaRef.current?.focus();
    }
  };

  // Stop sprint
  const stopSprint = () => {
    setIsActive(false);
    setIsPaused(false);
    setDangerLevel(0);
    
    // Calculate final stats
    const stats: SprintStats = {
      wordsWritten,
      timeElapsed: sprintDuration * 60 - timeLeft,
      wpm,
      streak,
      achievement: achievements[achievements.length - 1]
    };
    
    onComplete?.(stats);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
    setLastTypedTime(Date.now());
    setDangerLevel(0); // Reset danger when typing
    
    // Check for achievements
    checkAchievements(getWordCount(newText) - startWordCount);
  };

  // Check achievements
  const checkAchievements = (words: number) => {
    const newAchievements: string[] = [];
    
    if (words >= 100 && !achievements.includes('100words')) {
      newAchievements.push('100words');
      showAchievement('🎯 100 Palavras!');
    }
    if (words >= 500 && !achievements.includes('500words')) {
      newAchievements.push('500words');
      showAchievement('🔥 500 Palavras!');
    }
    if (words >= 1000 && !achievements.includes('1000words')) {
      newAchievements.push('1000words');
      showAchievement('🏆 1000 Palavras!');
    }
    if (wpm >= 50 && !achievements.includes('fast50')) {
      newAchievements.push('fast50');
      showAchievement('⚡ 50 PPM!');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setStreak(prev => prev + 1);
    }
  };

  const showAchievement = (text: string) => {
    // In a real app, this would show a toast notification
    console.log('Achievement:', text);
  };

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopSprint();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft]);

  // Danger mode effect
  useEffect(() => {
    if (dangerMode && isActive && !isPaused) {
      dangerIntervalRef.current = setInterval(() => {
        const timeSinceTyped = Date.now() - lastTypedTime;
        
        if (timeSinceTyped > 3000) { // 3 seconds without typing
          setDangerLevel(prev => Math.min(prev + 1, 10));
        }
      }, 500);
    } else {
      if (dangerIntervalRef.current) {
        clearInterval(dangerIntervalRef.current);
      }
      setDangerLevel(0);
    }

    return () => {
      if (dangerIntervalRef.current) {
        clearInterval(dangerIntervalRef.current);
      }
    };
  }, [dangerMode, isActive, isPaused, lastTypedTime]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-300 ${
      dangerLevel > 0 ? `bg-red-${Math.min(dangerLevel * 100, 900)}` : 'bg-brand-background'
    }`}>
      {/* Sprint Header */}
      <div className="bg-brand-surface/50 backdrop-blur-sm border-b border-brand-secondary/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Settings (only when not active) */}
          {!isActive ? (
            <div className="flex items-center gap-6">
              <div>
                <label className="text-xs text-brand-text-secondary">Duração (min)</label>
                <input
                  type="number"
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(Number(e.target.value))}
                  className="block w-20 px-2 py-1 bg-brand-secondary/30 rounded text-sm"
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="text-xs text-brand-text-secondary">Meta de Palavras</label>
                <input
                  type="number"
                  value={wordGoal}
                  onChange={(e) => setWordGoal(Number(e.target.value))}
                  className="block w-24 px-2 py-1 bg-brand-secondary/30 rounded text-sm"
                  min="50"
                  step="50"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dangerMode}
                  onChange={(e) => setDangerMode(e.target.checked)}
                  className="text-red-600"
                />
                <span className="text-sm">Modo Perigo 🔥</span>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              {/* Timer */}
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-brand-text-primary">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-brand-text-secondary">Tempo Restante</div>
              </div>
              
              {/* Words Written */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {wordsWritten}
                </div>
                <div className="text-xs text-brand-text-secondary">Palavras</div>
              </div>
              
              {/* WPM */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {wpm}
                </div>
                <div className="text-xs text-brand-text-secondary">PPM</div>
              </div>
              
              {/* Streak */}
              {streak > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 flex items-center gap-1">
                    <FireIcon className="w-5 h-5" />
                    {streak}
                  </div>
                  <div className="text-xs text-brand-text-secondary">Streak</div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                onClick={startSprint}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                <PlayIcon className="w-5 h-5" />
                Iniciar Sprint
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                >
                  {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopSprint}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <StopIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="max-w-6xl mx-auto mt-4">
            <div className="w-full bg-brand-secondary/30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
              <span>{wordsWritten} / {wordGoal} palavras</span>
              <span>{Math.round(progress)}% da meta</span>
            </div>
          </div>
        )}
      </div>

      {/* Writing Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            disabled={!isActive || isPaused}
            className={`w-full h-full p-6 bg-brand-surface/50 rounded-xl border transition-all resize-none
              ${dangerLevel > 5 ? 'border-red-500 animate-pulse' : 'border-brand-secondary/30'}
              ${!isActive || isPaused ? 'opacity-50' : ''}
              text-brand-text-primary placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder={isActive ? "Continue escrevendo..." : "Clique em 'Iniciar Sprint' para começar"}
          />
        </div>
      </div>

      {/* Danger Mode Warning */}
      {dangerMode && dangerLevel > 5 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-6xl font-bold text-red-600 animate-pulse opacity-50">
            ⚠️ CONTINUE ESCREVENDO!
          </div>
        </div>
      )}

      {/* Achievement Popup (simplified) */}
      {achievements.length > 0 && (
        <div className="absolute top-20 right-4 space-y-2">
          {achievements.slice(-3).map((achievement, i) => (
            <div key={i} className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg animate-bounce">
              <TrophyIcon className="w-5 h-5 inline mr-2" />
              {achievement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingSprint;