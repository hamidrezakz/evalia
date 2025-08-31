"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import styles from "./orthogonal-flow-background.module.css";

type Pulse = {
  x: number;
  y: number;
  dir: 0 | 1; // 0: horizontal, 1: vertical
  forward: boolean;
  progress: number;
  speed: number;
  key: string;
};

interface OrthogonalFlowBackgroundProps {
  rows?: number;
  cols?: number;
  pulseCount?: number;
  glowColor?: string;
  lineColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const OrthogonalFlowBackground: React.FC<OrthogonalFlowBackgroundProps> = ({
  rows = 7,
  cols = 7,
  pulseCount = 8,
  glowColor,
  lineColor,
  className,
  style,
}) => {
  // CSS vars for color
  const cssVars = {
    ...(glowColor ? { "--ofb-glow": glowColor } : {}),
    ...(lineColor ? { "--ofb-line": lineColor } : {}),
  } as any;

  // Grid lines
  const horizontal = useMemo(() => Array(rows).fill(0), [rows]);
  const vertical = useMemo(() => Array(cols).fill(0), [cols]);

  // Pulse state
  const [pulses, setPulses] = useState<Pulse[]>(() => {
    const arr: Pulse[] = [];
    for (let i = 0; i < pulseCount; i++) {
      const axis: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
      const forward = Math.random() < 0.5;
      const x =
        axis === 0
          ? forward
            ? 0
            : cols - 1
          : Math.floor(Math.random() * cols);
      const y =
        axis === 1
          ? forward
            ? 0
            : rows - 1
          : Math.floor(Math.random() * rows);
      arr.push({
        x,
        y,
        dir: axis,
        forward,
        progress: Math.random(),
        speed: 0.18 + Math.random() * 0.12,
        key: `p${i}_${Math.random().toFixed(6)}`,
      });
    }
    return arr;
  });

  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // Re-init pulses if grid size or count changes
    setPulses(() => {
      const arr: Pulse[] = [];
      for (let i = 0; i < pulseCount; i++) {
        const axis: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
        const forward = Math.random() < 0.5;
        const x =
          axis === 0
            ? forward
              ? 0
              : cols - 1
            : Math.floor(Math.random() * cols);
        const y =
          axis === 1
            ? forward
              ? 0
              : rows - 1
            : Math.floor(Math.random() * rows);
        arr.push({
          x,
          y,
          dir: axis,
          forward,
          progress: Math.random(),
          speed: 0.18 + Math.random() * 0.12,
          key: `p${i}_${Math.random().toFixed(6)}`,
        });
      }
      return arr;
    });
  }, [rows, cols, pulseCount]);

  useEffect(() => {
    let last = performance.now();
    function animate(now: number) {
      const dt = Math.min(32, now - last);
      last = now;
      setPulses((prev) =>
        prev.map((p) => {
          let { x, y, dir, forward, progress, speed } = p;
          let prog = progress + (dt * speed) / 1000;
          let newX = x,
            newY = y,
            newDir = dir,
            newForward = forward;
          // Only turn at intersection
          if (prog >= 1) {
            prog = 0;
            // At intersection: maybe turn
            if (Math.random() < 0.45) {
              newDir = dir === 0 ? 1 : 0;
            }
            // Move to next cell in current/new direction
            if (newDir === 0) {
              newX = x + (forward ? 1 : -1);
            } else {
              newY = y + (forward ? 1 : -1);
            }
          }
          // If out of bounds, respawn at random edge
          if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
            const axis: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
            const fwd = Math.random() < 0.5;
            const nx =
              axis === 0
                ? fwd
                  ? 0
                  : cols - 1
                : Math.floor(Math.random() * cols);
            const ny =
              axis === 1
                ? fwd
                  ? 0
                  : rows - 1
                : Math.floor(Math.random() * rows);
            return {
              ...p,
              x: nx,
              y: ny,
              dir: axis,
              forward: fwd,
              progress: 0,
              speed: 0.18 + Math.random() * 0.12,
            };
          }
          return {
            ...p,
            x: newX,
            y: newY,
            dir: newDir,
            forward: newForward,
            progress: prog,
          };
        })
      );
      reqRef.current = requestAnimationFrame(animate);
    }
    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current !== null) cancelAnimationFrame(reqRef.current);
    };
  }, [rows, cols, pulseCount]);

  // Grid cell size in percent
  const cellW = 100 / (cols + 1);
  const cellH = 100 / (rows + 1);

  return (
    <div
      className={styles.orthFlowRoot + (className ? " " + className : "")}
      style={{ ...cssVars, ...style }}
      aria-hidden>
      <div className={styles.gridLayer}>
        {horizontal.map((_, i) => (
          <div
            key={"h" + i}
            className={styles.hLine}
            style={{ top: `${((i + 1) / (rows + 1)) * 100}%` }}
          />
        ))}
        {vertical.map((_, i) => (
          <div
            key={"v" + i}
            className={styles.vLine}
            style={{ left: `${((i + 1) / (cols + 1)) * 100}%` }}
          />
        ))}
        {pulses.map((p) => {
          // Calculate position
          let left = (p.x + (p.dir === 0 ? p.progress : 0)) * cellW + cellW;
          let top = (p.y + (p.dir === 1 ? p.progress : 0)) * cellH + cellH;
          let style: React.CSSProperties = {
            left: `${left}%`,
            top: `${top}%`,
            width: p.dir === 0 ? 80 : 8,
            height: p.dir === 1 ? 80 : 8,
            opacity: 0.95,
            transition: "none",
          };
          return (
            <div
              key={p.key}
              className={
                p.dir === 0 ? styles.pulseHorizontal : styles.pulseVertical
              }
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrthogonalFlowBackground;
