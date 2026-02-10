"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export const MusicSection = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const progress = useMemo(() => {
    if (duration <= 0) return 0;
    return Math.min(1, Math.max(0, currentTime / duration));
  }, [currentTime, duration]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      const d = el.duration;
      setDuration(Number.isFinite(d) ? d : 0);
    };

    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    // Estado inicial
    onLoaded();
    onTime();

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        // iOS/Android: requiere interacción del usuario (este botón ya cuenta como interacción)
      }
      return;
    }

    el.pause();
    setIsPlaying(false);
  };

  const seekToFraction = (fraction: number) => {
    const el = audioRef.current;
    if (!el || duration <= 0) return;

    const nextTime = Math.max(0, Math.min(duration, duration * fraction));
    el.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const skipSeconds = (seconds: number) => {
    const el = audioRef.current;
    if (!el) return;

    const total = Number.isFinite(el.duration) ? el.duration : duration;
    const nextTime = Math.max(
      0,
      Math.min(total || 0, el.currentTime + seconds),
    );
    el.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-110 px-6 text-center">
        <div className="pb-6.5 pt-2.5 text-center">
          <p className="font-moon-time text-6xl leading-5 ">
            Jennifer Samantha
          </p>
        </div>
        {/* Título con flores decorativas */}
        <div className="relative mb-6 flex items-center justify-center">
          <Image
            src="/images/MusicSection/flower-left-music.svg"
            alt=""
            className="absolute left-0 top-15 -translate-y-1/2 -translate-x-1/2"
            width={188}
            height={385}
          />
          <h3 className="relative z-10 top-10 font-bad-script text-3xl text-black">
            Reproduce mi canción favorita
          </h3>
          <Image
            src="/images/MusicSection/flower-rigth-music.svg"
            alt=""
            className="absolute right-0 top-15 -translate-y-1/2  translate-x-1/2"
            width={188}
            height={385}
          />
        </div>

        {/* Barra (línea + relleno) */}
        <div className="relative mb-8 h-6 mt-15">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-black/30" />

          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-red-600"
            style={{ width: `${progress * 100}%` }}
          />

          {/* Bolita (opcional, como tu mock) */}
          {/* <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-600"
            style={{ left: `calc(${progress * 100}% - 6px)` }}
          /> */}

          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => seekToFraction(Number(e.target.value))}
            className="absolute left-0 top-0 h-full w-full cursor-pointer appearance-none bg-transparent"
            aria-label="Progreso"
          />
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-10">
          <button
            type="button"
            onClick={() => skipSeconds(-10)}
            className="text-black transition hover:opacity-70"
            aria-label="Atrás 10 segundos"
          >
            <span className="text-3xl">&lt;</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white transition hover:opacity-80"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <span className="text-xl font-bold">II</span>
            ) : (
              <span className="text-xl font-bold">▶</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => skipSeconds(10)}
            className="text-black transition hover:opacity-70"
            aria-label="Adelante 10 segundos"
          >
            <span className="text-3xl">&gt;</span>
          </button>
        </div>

        {/* Volumen */}
        {/* <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-sm text-black/70">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-2 w-56 cursor-pointer accent-red-600"
            aria-label="Volumen"
          />
        </div> */}

        {/* Audio real (oculto, pero es el que manda) */}
        <audio
          ref={audioRef}
          src="/music/cancion.mp3"
          preload="metadata"
          className="hidden"
        />
      </div>
    </section>
  );
};
