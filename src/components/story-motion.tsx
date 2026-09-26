"use client";

import { useEffect } from "react";

export function StoryMotion() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) return;

    const root = document.documentElement;
    const revealTargets = document.querySelectorAll<HTMLElement>(".story-page [data-reveal]");
    const countTargets = document.querySelectorAll<HTMLElement>(".story-page [data-count]");
    const frames = new Set<number>();
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          const end = Number(element.dataset.count);
          if (!Number.isFinite(end)) continue;
          const prefix = element.dataset.prefix ?? "";
          const suffix = element.dataset.suffix ?? "";
          const duration = 850;
          let start: number | undefined;
          const frame = (now: number) => {
            start ??= now;
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = prefix + (end * eased).toFixed(1) + suffix;
            if (progress < 1) frames.add(requestAnimationFrame(frame));
            else element.textContent = prefix + end.toFixed(1) + suffix;
          };
          frames.add(requestAnimationFrame(frame));
        }
      },
      { threshold: 0.35 },
    );

    root.classList.add("story-motion-ready");
    revealTargets.forEach((target) => revealObserver.observe(target));
    countTargets.forEach((target) => countObserver.observe(target));
    return () => {
      root.classList.remove("story-motion-ready");
      revealObserver.disconnect();
      countObserver.disconnect();
      frames.forEach((frame) => cancelAnimationFrame(frame));
    };
  }, []);

  return null;
}
