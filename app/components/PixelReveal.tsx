"use client";

import { useLayoutEffect, useRef } from "react";

const PIXEL_SIZE = 10;
const DURATION = 1600;

// Dein Header hat h-16 = 64px
const HEADER_HEIGHT = 64;

function hash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

export default function PixelReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      return;
    }

    const context = canvas.getContext("2d");
    const container = canvas.parentElement;

    if (!context || !container) return;

    const styles = getComputedStyle(document.documentElement);

    const base = styles.getPropertyValue("--color-base-100").trim() || "#fbfaff";

    const primary = styles.getPropertyValue("--color-primary").trim() || "#c9b6ff";

    const accent = styles.getPropertyValue("--color-accent").trim() || "#c6f1d6";

    const cream = "#fffaf0";

    let dpr = 1;
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = Math.max(window.innerHeight - HEADER_HEIGHT, 0);

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      // Canvas bei jedem Frame transparent zurücksetzen
      context.clearRect(0, 0, width, height);

      /*
       * Position des Content-Wrappers im gesamten Dokument.
       * Dadurch funktioniert der Effekt auch beim Scrollen.
       */
      const containerDocumentTop = container.getBoundingClientRect().top + window.scrollY;

      const totalHeight = Math.max(container.scrollHeight, 1);

      const columns = Math.ceil(width / PIXEL_SIZE);
      const rows = Math.ceil(height / PIXEL_SIZE);

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = column * PIXEL_SIZE;
          const y = row * PIXEL_SIZE;

          /*
           * Wo befindet sich dieser sichtbare Pixel
           * innerhalb des gesamten Content-Bereichs?
           */
          const documentY = window.scrollY + HEADER_HEIGHT + y;

          const contentY = documentY - containerDocumentTop;

          const verticalProgress = Math.min(Math.max(contentY / totalHeight, 0), 1);

          /*
           * Deterministischer Zufall:
           * Pixel flackern nicht bei jedem Frame neu,
           * wirken aber trotzdem leicht random.
           */
          const absoluteRow = Math.floor(contentY / PIXEL_SIZE);

          const jitter = hash(column, absoluteRow, 1) * 0.16;

          const revealAt = Math.min(verticalProgress * 0.84 + jitter, 1);

          /*
           * Bereits freigelegte Pixel werden gar nicht mehr gezeichnet.
           * Dort sieht man direkt die Website darunter.
           */
          if (progress >= revealAt) {
            continue;
          }

          // Ruhige Markenfarb-Verteilung
          const colorRandom = hash(column, absoluteRow, 2);

          let color = base;

          if (colorRandom > 0.88) {
            color = primary;
          }

          if (colorRandom > 0.96) {
            color = accent;
          }

          if (colorRandom > 0.985) {
            color = cream;
          }

          context.fillStyle = color;

          context.fillRect(x, y, PIXEL_SIZE + 1, PIXEL_SIZE + 1);
        }
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        canvas.style.display = "none";
      }
    };

    animationFrame = requestAnimationFrame(animate);

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed left-0 right-0 top-16 z-40 pointer-events-none" aria-hidden="true" />;
}
