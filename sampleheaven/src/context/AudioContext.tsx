"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Sample } from '../data/mockData';

interface AudioContextType {
  currentSample: Sample | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (sample: Sample) => void;
  pause: () => void;
  togglePlay: (sample: Sample) => void;
  seek: (percent: number) => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10); // default mock duration is 10s
  const [volume, setVolumeState] = useState<number>(0.7);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const synthActiveNodesRef = useRef<any[]>([]);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const playbackTimerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Audio API on first user interaction
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Set up volume control
  const setVolume = (vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    if (audioRef.current) {
      audioRef.current.volume = clampedVol;
    }
  };

  // Helper: Stop any active synthesiser playbacks
  const stopSynthesis = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    synthActiveNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) { }
    });
    synthActiveNodesRef.current = [];
  };

  // Synthesiser Engine: Generates sounds on-the-fly depending on sample parameters
  const playSynthesizedSample = (sample: Sample, startOffset: number = 0) => {
    stopSynthesis();
    const ctx = getAudioContext();

    // Parse duration
    const durationParts = sample.duration.split(':');
    const parsedDuration = parseInt(durationParts[0]) * 60 + parseFloat(durationParts[1]);
    setDuration(parsedDuration);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime); // keep synth volume moderate
    masterGain.connect(ctx.destination);

    // Save starting time reference for the progress bar
    startTimeRef.current = ctx.currentTime - startOffset;
    setCurrentTime(startOffset);

    // Progress bar runner
    const updateProgress = () => {
      if (!audioCtxRef.current) return;
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      if (elapsed >= parsedDuration) {
        setCurrentTime(parsedDuration);
        setIsPlaying(false);
        stopSynthesis();
      } else {
        setCurrentTime(elapsed);
        playbackTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };
    playbackTimerRef.current = requestAnimationFrame(updateProgress);

    // 1. One-Shot TRAP 808 PUNCH
    if (sample.type === 'One-Shot' && (sample.genre === 'Trap' || sample.genre === 'Hip-Hop')) {
      if (startOffset > 1) return; // already finished

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Pitch envelope: sweep fast from 150Hz to 48Hz
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.15);

      // Amplitude envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      // Distortion node to add grit to the 808
      const distortion = ctx.createWaveShaper();
      const makeDistortionCurve = (amount = 20) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };
      distortion.curve = makeDistortionCurve(30);
      distortion.oversample = '4x';

      osc.connect(distortion);
      distortion.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.3);

      synthActiveNodesRef.current.push(osc);
    }
    // 2. LOOPS (Chord progressions or arpeggios, e.g., Lo-Fi Piano or Synthwave)
    else if (sample.type === 'Loop') {
      const bpm = sample.bpm || 90;
      const beatSec = 60 / bpm;
      const isLofi = sample.genre === 'Lo-Fi';
      const isElectronic = sample.genre === 'Electronic';

      // Simple arpeggiator step loop
      let step = 0;
      const playStep = () => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        // Jazzy minor 9 chords for Lo-Fi, or driving arps for Synthwave
        const chords = isLofi
          ? [146.83, 174.61, 220.00, 261.63, 293.66] // Dm9 notes: D3, F3, A3, C4, E4
          : [220.00, 261.63, 329.63, 392.00, 440.00]; // Am7 notes: A3, C4, E4, G4, A4

        const noteIndex = step % chords.length;
        let freq = chords[noteIndex];
        if (isElectronic) {
          // Double time synthwave arpeggio
          const octaves = [1, 2, 1, 2];
          freq = freq * octaves[step % octaves.length];
        }

        osc.type = isLofi ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        // Lo-Fi has lower cutoff (subtle muffled sound), Electronic sweeps filter
        if (isLofi) {
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        } else {
          // filter sweep
          const sweepFreq = 1200 + Math.sin(ctx.currentTime * 2) * 600;
          filter.frequency.setValueAtTime(sweepFreq, ctx.currentTime);
        }

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beatSec * 0.95);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + beatSec * 0.95);
        synthActiveNodesRef.current.push(osc);

        step++;
      };

      // Set interval for note triggering
      const stepDurationMs = (isElectronic ? beatSec / 2 : beatSec) * 1000;

      // Trigger first note immediately if offset is within bounds
      playStep();
      synthIntervalRef.current = setInterval(playStep, stepDurationMs);
    }
    // 3. SFX (Cinematic Riser or Whoosh - Noise Sweeps)
    else if (sample.type === 'SFX') {
      const bufferSize = ctx.sampleRate * parsedDuration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Populate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';

      const gainNode = ctx.createGain();

      // Risers sweep filter upwards, Whooshes sweep filter fast up and down
      const isRiser = sample.title.toLowerCase().includes('riser');
      if (isRiser) {
        filter.Q.setValueAtTime(8, ctx.currentTime);
        filter.frequency.setValueAtTime(80, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + parsedDuration);

        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + parsedDuration - 0.2);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + parsedDuration);
      } else {
        // Whoosh sweep
        filter.Q.setValueAtTime(3, ctx.currentTime);
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(3000, ctx.currentTime + parsedDuration / 2);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + parsedDuration);

        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + parsedDuration / 2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + parsedDuration);
      }

      // Add a simple delay/feedback node to mimic reverb space
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.25;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.35;

      noiseSource.connect(filter);
      filter.connect(gainNode);

      // Feed to reverb delay lines
      gainNode.connect(masterGain);
      gainNode.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(delay); // feedback loop
      delayGain.connect(masterGain);

      // Seek starting position
      if (startOffset < parsedDuration) {
        noiseSource.start(ctx.currentTime, startOffset);
        synthActiveNodesRef.current.push(noiseSource);
      }
    }
    // 4. MIDI / CHORDS (Ethereal Ambient pads)
    else {
      // Ambient sweep pad chords
      const notes = [130.81, 196.00, 261.63, 329.63, 392.00]; // C major chords: C3, G3, C4, E4, G4
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Add subtle vibrato
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.value = 4.5 + i * 0.2; // slight detune LFO
        vibratoGain.gain.value = 1.5;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + parsedDuration);

        osc.connect(gainNode);
        gainNode.connect(masterGain);

        vibrato.start(ctx.currentTime);
        osc.start(ctx.currentTime + (i * 0.1));
        osc.stop(ctx.currentTime + parsedDuration);

        synthActiveNodesRef.current.push(osc);
      });
    }
  };

  const play = (sample: Sample) => {
    // Pack / Kit audio bypass - no music is played for ZIP/RAR archives
    if (sample.type === 'Pack' || sample.type === 'Kit') {
      return;
    }

    // Stop any active synth
    stopSynthesis();
    
    // Pause any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (currentSample?.id === sample.id) {
      setIsPlaying(true);
      if (sample.audioUrl) {
        audioRef.current?.play().catch(err => console.error("Audio resume failed:", err));
      } else {
        playSynthesizedSample(sample, pauseTimeRef.current);
      }
    } else {
      // Play a new sample from start
      setCurrentSample(sample);
      setIsPlaying(true);
      pauseTimeRef.current = 0;

      if (sample.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = sample.audioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = volume;
          audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
        }
      } else {
        playSynthesizedSample(sample, 0);
      }
    }
  };

  const pause = () => {
    if (isPlaying) {
      if (currentSample?.audioUrl && audioRef.current) {
        audioRef.current.pause();
        pauseTimeRef.current = audioRef.current.currentTime;
      } else {
        stopSynthesis();
        if (audioCtxRef.current) {
          pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
        }
      }
      setIsPlaying(false);
    }
  };

  const togglePlay = (sample: Sample) => {
    if (sample.type === 'Pack' || sample.type === 'Kit') {
      return;
    }
    if (currentSample?.id === sample.id && isPlaying) {
      pause();
    } else {
      play(sample);
    }
  };

  const seek = (percent: number) => {
    if (!currentSample) return;
    const targetTime = percent * duration;
    pauseTimeRef.current = targetTime;
    setCurrentTime(targetTime);
    
    if (currentSample.audioUrl && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    } else {
      if (isPlaying) {
        playSynthesizedSample(currentSample, targetTime);
      }
    }
  };

  // Initialize HTML5 Audio element and listeners on mount
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      stopSynthesis();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentSample,
        isPlaying,
        currentTime,
        duration,
        volume,
        play,
        pause,
        togglePlay,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
