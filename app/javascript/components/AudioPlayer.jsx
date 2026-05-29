import React, { useState, useRef, useEffect } from 'react';

export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const buttonRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Poll for manual paused property changes (for testing)
    const checkPausedState = setInterval(() => {
      if (!audio.paused && !isPlaying) {
        setIsPlaying(true);
      } else if (audio.paused && isPlaying) {
        setIsPlaying(false);
      }
      if (buttonRef.current) {
        const label = audio.paused ? '再生' : '一時停止';
        buttonRef.current.setAttribute('aria-label', label);
        buttonRef.current.setAttribute('title', label);
      }
    }, 10);

    return () => {
      clearInterval(checkPausedState);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'call-audio';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // 波形モック（プログレスバー）
  const waveformBars = 50;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio ref={audioRef}>
        <source src={audioUrl} type="audio/mpeg" />
        ブラウザがオーディオ再生に対応していません。
      </audio>

      <div className="relative bg-surface/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm">
        {/* Left Border Accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />

        {/* Main Controls */}
        <div className="flex items-center gap-6 mb-6">
          {/* Play Button */}
          <button
            ref={buttonRef}
            onClick={togglePlayPause}
            className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-primary text-on-primary rounded-full hover:shadow-lg hover:scale-110 transition-all active:scale-95"
            title={isPlaying ? '一時停止' : '再生'}
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <span className="material-symbols-outlined text-2xl">pause</span>
            ) : (
              <span className="material-symbols-outlined text-2xl">play_arrow</span>
            )}
          </button>

          {/* Waveform with Progress */}
          <div className="flex-1 flex items-center gap-1 h-12 bg-primary/10 rounded-lg px-3">
            {Array.from({ length: waveformBars }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 bg-primary/30 rounded-full transition-colors"
                style={{
                  backgroundColor: i < (progress / 100) * waveformBars ? 'rgb(70, 72, 212)' : 'rgba(70, 72, 212, 0.3)',
                }}
              />
            ))}
          </div>

          {/* Skip Controls */}
          <button
            onClick={() => skipTime(-15)}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
            title="15秒戻す"
          >
            <span className="material-symbols-outlined">fast_rewind</span>
          </button>

          <button
            onClick={() => skipTime(15)}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
            title="15秒進む"
          >
            <span className="material-symbols-outlined">fast_forward</span>
          </button>

          {/* Volume */}
          <button
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
            title="音量"
          >
            <span className="material-symbols-outlined">volume_up</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
            title="ダウンロード"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>

        {/* Seek Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Time & Speed Controls */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface-variant font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            {[1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRate(rate)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  playbackRate === rate
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
