"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Sparkle } from "lucide-react";
import { DEMO_DURATION, videoDemoScenes, type DemoAction } from "@/lib/video-demo-scenes";

function clockLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function parseClock(value: string) {
  const input = value.trim();
  if (!/^(?:\d+|\d+:[0-5]\d)$/.test(input)) return null;
  const parts = input.split(":").map(Number);
  const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  return Number.isSafeInteger(seconds) && seconds <= DEMO_DURATION ? seconds : null;
}

function target(name: string) {
  return document.querySelector<HTMLElement>(`[data-demo="${name}"]`);
}

const planOpenIndex = videoDemoScenes.findIndex((scene) => scene.action === "open-plan");
const planCloseIndex = videoDemoScenes.findIndex((scene) => scene.action === "close-plan");
const securityOpenIndex = videoDemoScenes.findIndex((scene) => scene.action === "open-security");
const closingAt = videoDemoScenes[videoDemoScenes.length - 1].start;

function sceneAt(seconds: number) {
  let index = 0;
  for (let i = 1; i < videoDemoScenes.length; i++) {
    if (seconds < videoDemoScenes[i].start) break;
    index = i;
  }
  return index;
}

function runAction(action: DemoAction) {
  const projects = target("requirement-projects") as HTMLDetailsElement | null;
  const security = target("requirement-security") as HTMLDetailsElement | null;
  if (action === "open-projects" && projects) {
    projects.open = true;
    return true;
  }
  if (action === "open-security" && security) {
    if (projects) projects.open = false;
    security.open = true;
    return true;
  }
  if (action === "open-plan" && target("plan-open")) {
    target("plan-open")?.click();
    return true;
  }
  if (action === "close-plan" && target("plan-close")) {
    target("plan-close")?.click();
    return true;
  }
  return false;
}

export function VideoDemoController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === "/demo" || searchParams.get("demo") === "video";
  const [running, setRunning] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [seekText, setSeekText] = useState("0:00");
  const [seekError, setSeekError] = useState(false);
  const closing = elapsed >= closingAt;
  const startAt = useRef(0);
  const elapsedRef = useRef(0);
  const sceneRef = useRef(-1);
  const navigated = useRef(new Set<number>());
  const acted = useRef(new Set<number>());
  const scrolled = useRef(new Set<number>());
  const highlighted = useRef<HTMLElement | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const animatedScroll = useRef<{
    index: number;
    from: number;
    to: number;
    start: number;
    duration: number;
  } | null>(null);
  const snapAfterSeek = useRef(false);

  const jumpTo = useCallback((seconds: number) => {
    const index = sceneAt(seconds);
    target("plan-close")?.click();
    for (const name of ["requirement-projects", "requirement-security"]) {
      const details = target(name) as HTMLDetailsElement | null;
      if (details) details.open = false;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    startAt.current = performance.now() - seconds * 1000;
    pendingSeek.current = seconds;
    elapsedRef.current = seconds;
    sceneRef.current = -1;
    navigated.current.clear();
    acted.current.clear();
    if (index >= securityOpenIndex) {
      const projectsIndex = videoDemoScenes.findIndex((scene) => scene.action === "open-projects");
      acted.current.add(projectsIndex);
    }
    if (index >= planCloseIndex) {
      acted.current.add(planOpenIndex);
      acted.current.add(planCloseIndex);
    }
    scrolled.current.clear();
    animatedScroll.current = null;
    snapAfterSeek.current = seconds > 0;
    highlighted.current?.classList.remove("video-demo-target");
    highlighted.current = null;
    setElapsed(seconds);
    setSceneIndex(index);
    setRunning(true);
    setControlsVisible(false);
  }, []);

  const start = useCallback(() => {
    setSeekText("0:00");
    setSeekError(false);
    jumpTo(0);
  }, [jumpTo]);

  const seek = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const seconds = parseClock(seekText);
    if (seconds === null) {
      setSeekError(true);
      return;
    }
    setSeekError(false);
    setSeekText(clockLabel(seconds));
    jumpTo(seconds);
  }, [jumpTo, seekText]);

  const restart = useCallback(() => {
    if (pathname !== "/demo") router.replace("/demo", { scroll: false });
    window.scrollTo({ top: 0, behavior: "instant" });
    start();
  }, [pathname, router, start]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("video-demo-idle", active && !running);
    root.classList.toggle("video-demo-running", active && running);
    root.classList.toggle("video-demo-closing", active && closing);
    return () => {
      root.classList.remove("video-demo-idle", "video-demo-running", "video-demo-closing");
    };
  }, [active, running, closing]);

  useEffect(() => {
    if (active && running && sceneIndex >= planOpenIndex && sceneIndex < planCloseIndex) {
      const phaseCount = videoDemoScenes
        .slice(planOpenIndex, sceneIndex + 1)
        .filter((scene) => scene.target?.startsWith("plan-phase-")).length;
      document.documentElement.dataset.videoPlanPhase = String(
        Math.max(0, phaseCount - 1),
      );
    } else {
      delete document.documentElement.dataset.videoPlanPhase;
    }
    return () => { delete document.documentElement.dataset.videoPlanPhase; };
  }, [active, running, sceneIndex]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, [contenteditable]")) return;
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key.toLowerCase() === "k" && running) setControlsVisible((visible) => !visible);
      if (event.key.toLowerCase() === "r") restart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, running, restart]);

  useEffect(() => {
    if (!active || !running) return;
    let frame = 0;
    const tick = () => {
      const exact = pendingSeek.current ?? Math.min((performance.now() - startAt.current) / 1000, DEMO_DURATION);
      const second = Math.floor(exact);
      if (second !== elapsedRef.current) {
        elapsedRef.current = second;
        setElapsed(second);
      }
      const nextIndex = sceneAt(exact);
      if (sceneRef.current !== nextIndex) {
        if (animatedScroll.current) {
          window.scrollTo({ top: animatedScroll.current.to, behavior: "instant" });
          animatedScroll.current = null;
        }
        sceneRef.current = nextIndex;
        setSceneIndex(nextIndex);
        highlighted.current?.classList.remove("video-demo-target");
        highlighted.current = null;
      }
      const scene = videoDemoScenes[nextIndex];
      const routePath = scene.route.split("?")[0];
      if (pathname !== routePath) {
        if (!navigated.current.has(nextIndex)) {
          navigated.current.add(nextIndex);
          router.replace(scene.route, { scroll: false });
        }
      } else {
        // Apply actions that became due while a browser frame was delayed.
        for (let i = 0; i <= nextIndex; i++) {
          const due = videoDemoScenes[i];
          if (due.route.split("?")[0] !== pathname || !due.action || acted.current.has(i)) continue;
          if (runAction(due.action)) acted.current.add(i);
        }
        const element = scene.target ? target(scene.target) : null;
        if (!scene.target || (element && element.getClientRects().length > 0)) {
          if (snapAfterSeek.current) {
            if (element) element.scrollIntoView({ behavior: "instant", block: scene.scroll === "top" ? "start" : "center" });
            else window.scrollTo({ top: 0, behavior: "instant" });
            scrolled.current.add(nextIndex);
            snapAfterSeek.current = false;
          } else if (!scrolled.current.has(nextIndex)) {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const behavior = reduced ? "instant" : "smooth";
            if (scene.scroll === "top" && !scene.target) window.scrollTo({ top: 0, behavior: "instant" });
            else if (element && scene.scroll && scene.scroll !== "none") {
              if (scene.scrollDuration && !reduced) {
                const rect = element.getBoundingClientRect();
                const offset = scene.scroll === "center" ? (window.innerHeight - rect.height) / 2 : 0;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                animatedScroll.current = {
                  index: nextIndex,
                  from: window.scrollY,
                  to: Math.max(0, Math.min(maxScroll, window.scrollY + rect.top - offset)),
                  start: scene.start,
                  duration: scene.scrollDuration,
                };
              } else {
                element.scrollIntoView({ behavior, block: scene.scroll === "top" ? "start" : "center" });
              }
            }
            scrolled.current.add(nextIndex);
          }
          const movement = animatedScroll.current;
          if (movement?.index === nextIndex) {
            const progress = Math.max(0, Math.min((exact - movement.start) / movement.duration, 1));
            const eased = progress * progress * (3 - 2 * progress);
            window.scrollTo({ top: movement.from + (movement.to - movement.from) * eased, behavior: "instant" });
            if (progress === 1) animatedScroll.current = null;
          }
          if (element && highlighted.current !== element) {
            highlighted.current?.classList.remove("video-demo-target");
            element.classList.add("video-demo-target");
            highlighted.current = element;
          }
          if (pendingSeek.current !== null) {
            startAt.current = performance.now() - pendingSeek.current * 1000;
            pendingSeek.current = null;
          }
        }
      }
      if (exact < DEMO_DURATION) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, running, pathname, router]);

  if (!active) return null;
  return (
    <>
      {closing && (
        <div className="video-demo-end" data-demo="closing-frame">
          <div className="video-demo-end-brand"><Sparkle size={27} strokeWidth={1.6} /> BidNorth<span>.</span></div>
          <h1>Bid smarter. Start stronger.</h1>
          <p>Know what is verified, missing, or needs review before you start a bid.</p>
        </div>
      )}
      {(!running || controlsVisible) && (
        <aside className="video-demo-controls" aria-label="Video demo controls">
          <span className="video-demo-kicker">Demo mode · fictional sample data</span>
          <strong data-demo="current-step">{running ? videoDemoScenes[sceneIndex].label : "Ready to record"}</strong>
          <div className="video-demo-control-row">
            <span className="video-demo-time" aria-label="Elapsed time">{clockLabel(elapsed)} / {clockLabel(DEMO_DURATION)}</span>
            {!running && <button type="button" onClick={start}>Start demo</button>}
            <button type="button" className="video-demo-restart" onClick={restart}>Restart</button>
          </div>
          <form className="video-demo-seek" onSubmit={seek}>
            <label htmlFor="video-demo-seek-time">Jump to time</label>
            <input
              id="video-demo-seek-time"
              aria-invalid={seekError}
              aria-describedby={seekError ? "video-demo-seek-error" : undefined}
              value={seekText}
              onChange={(event) => { setSeekText(event.target.value); setSeekError(false); }}
              inputMode="numeric"
              placeholder="1:30"
            />
            <button type="submit">Jump</button>
          </form>
          {seekError && <small id="video-demo-seek-error" className="video-demo-seek-error" role="alert">Enter m:ss or seconds, up to {clockLabel(DEMO_DURATION)}.</small>}
        </aside>
      )}
    </>
  );
}
