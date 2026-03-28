import { useCallback, useEffect, useRef } from "react";

const MUTE_KEY = "dinki_dine_muted";

export function useSound(unacknowledgedCount: number, isMuted: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // First tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(660, now + 0.2);
      gain2.gain.setValueAtTime(0.3, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.4);
    } catch (_e) {
      // Audio not available
    }
  }, [getAudioCtx]);

  const startRingtone = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    playBeep();
    intervalRef.current = setInterval(playBeep, 1500);
  }, [playBeep]);

  const stopRingtone = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  useEffect(() => {
    if (unacknowledgedCount > 0 && !isMuted) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      // Don't stop on every re-render, only on unmount
    };
  }, [unacknowledgedCount, isMuted, startRingtone, stopRingtone]);

  useEffect(() => {
    return () => {
      stopRingtone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopRingtone]);

  return { playBeep };
}

export function loadMutePref(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveMutePref(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "true" : "false");
  } catch {
    // ignore
  }
}
