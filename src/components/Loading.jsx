import { useEffect, useState } from 'react';
import './Loading.css';

const WORD_REST = ['a', 'k', 'h', 'a', 'r', 'a'];

export default function Loading() {
  const [phase, setPhase] = useState('playing');
  const isActive = phase !== 'done';

  useEffect(() => {
    if (!isActive) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reducedMotion ? 1250 : 3050;
    const leave = reducedMotion ? 160 : 900;

    const leaveTimer = window.setTimeout(() => setPhase('leaving'), hold);
    const doneTimer = window.setTimeout(() => setPhase('done'), hold + leave + 60);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div
      className={`intro${phase === 'leaving' ? ' intro--leaving' : ''}`}
      role="img"
      aria-label="FAKHARA — L'ART DE LA POTERIE MAROCAINE"
    >
      <div className="intro__backdrop" aria-hidden="true" />

      <svg className="intro__zellij" viewBox="0 0 600 600" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="300" cy="300" r="242" opacity="0.5" />
          <circle cx="300" cy="300" r="210" opacity="0.32" />
          <path d="M300 82 349 251 518 300 349 349 300 518 251 349 82 300 251 251Z" opacity="0.62" />
          <path d="M300 146 331 269 454 300 331 331 300 454 269 331 146 300 269 269Z" opacity="0.34" />
        </g>
      </svg>

      <div className="intro__glow" aria-hidden="true" />

      <div className="intro__wordmark" aria-hidden="true">
        <span className="intro__f">F</span>
        <span className="intro__tail">
          <span className="intro__tail-inner">
            {WORD_REST.map((letter, index) => (
              <span
                className="intro__letter"
                key={`${letter}-${index}`}
                style={{ '--i': index }}
              >
                {letter}
              </span>
            ))}
          </span>
        </span>
      </div>

      <div className="intro__signature" aria-hidden="true">
        <span className="intro__rule" />
        <p className="intro__tagline">L'ART DE LA POTERIE MAROCAINE</p>
        <span className="intro__rule" />
      </div>

      <div className="intro__sweep" aria-hidden="true" />
    </div>
  );
}
