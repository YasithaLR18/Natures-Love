"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StoryTypewriterProps = {
  paragraphs: string[];
};

export function StoryTypewriter({ paragraphs }: StoryTypewriterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);

  const paragraphStarts = useMemo(() => {
    return paragraphs.map((_, paragraphIndex) =>
      paragraphs
        .slice(0, paragraphIndex)
        .reduce((count, paragraph) => count + paragraph.length, 0),
    );
  }, [paragraphs]);

  const totalChars = useMemo(
    () => paragraphs.reduce((count, paragraph) => count + paragraph.length, 0),
    [paragraphs],
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      const timeout = window.setTimeout(() => {
        setHasStarted(true);
        setVisibleChars(totalChars);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.28,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [totalChars]);

  useEffect(() => {
    if (!hasStarted || visibleChars >= totalChars) {
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleChars((current) => Math.min(current + 3, totalChars));
    }, 18);

    return () => window.clearInterval(interval);
  }, [hasStarted, totalChars, visibleChars]);

  return (
    <div
      className="about-story-copy about-story-typewriter"
      data-typing-complete={visibleChars >= totalChars}
      ref={containerRef}
    >
      {paragraphs.map((paragraph, paragraphIndex) => {
        const paragraphStart = paragraphStarts[paragraphIndex];

        return (
          <p aria-label={paragraph} key={paragraph} suppressHydrationWarning>
            <span aria-hidden="true">
              {Array.from(paragraph).map((character, characterIndex) => {
                const isVisible = paragraphStart + characterIndex < visibleChars;

                return (
                  <span
                    className={isVisible ? "type-char type-char--visible" : "type-char"}
                    key={`${paragraphStart}-${characterIndex}`}
                  >
                    {character}
                  </span>
                );
              })}
            </span>
          </p>
        );
      })}
    </div>
  );
}
