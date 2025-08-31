"use client";
import React, { useMemo, useEffect } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface MotionGridFlowBackgroundProps {
  rows?: number; // number of horizontal lines
  cols?: number; // number of vertical lines
  pulseCount?: number; // number of moving lights
  className?: string;
  style?: React.CSSProperties;
  colorLine?: string; // rgba/hex for lines
  colorGlow?: string; // glow / pulse color
  speed?: number; // cells per second (all pulses)
  turnChance?: number; // chance to turn at intersection (0..1)
}

/**
 * Framer Motion powered orthogonal dashed grid background.
 * - Fills parent (use relative parent + overflow-hidden if needed)
 * - Pulses move smoothly, turn only at intersections, respawn from edges
 * - Fully controlled via props, Tailwind-friendly
 */
export const MotionGridFlowBackground: React.FC<
  MotionGridFlowBackgroundProps
> = ({
  rows = 8,
  cols = 8,
  pulseCount = 8,
  className,
  style,
  colorLine = "rgba(255,255,255,0.12)",
  colorGlow = "#0ea5e9",
  speed = 0.5,
  turnChance = 0.42,
}) => {
  // Generate grid meta
  const hLines = useMemo(() => Array(rows).fill(0), [rows]);
  const vLines = useMemo(() => Array(cols).fill(0), [cols]);

  // Pre-generate pulses meta (positions & dynamic state container)
  // Ref holds mutable pulse state
  type PulseDir = 0 | 1; // 0: horizontal, 1: vertical
  type PulseState = {
    id: string;
    x: number;
    y: number;
    dir: PulseDir;
    forward: boolean;
    progress: number;
    speed: number;
    turning?: {
      toDir: PulseDir;
      toForward: boolean;
      turnProgress: number; // 0..1
      turnLeft: boolean;
    };
  };
  const pulseStateRef = React.useRef<PulseState[]>([]);

  // Initialize / re-initialize when structural props change
  useEffect(() => {
    // Each pulse: fixed axis, fixed line, fixed direction, fixed speed
    const pulses = Array.from({ length: pulseCount }).map((_, i) => {
      const dir: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
      // Pick a random line for each pulse
      const x = dir === 0 ? 0 : Math.floor(Math.random() * cols);
      const y = dir === 1 ? 0 : Math.floor(Math.random() * rows);
      const forward = true; // always start forward
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `p_${Math.random().toString(36).slice(2)}`;
      return { id, x, y, dir, forward, progress: 0, speed };
    });
    pulseStateRef.current = pulses;
  }, [pulseCount, rows, cols, speed]);

  // Animation frame loop
  const [, forceRerender] = React.useReducer((c) => c + 1, 0);
  const lastRef = React.useRef<number>(performance.now());
  const accumRef = React.useRef(0);

  useAnimationFrame((now) => {
    const dtMs = now - lastRef.current;
    if (dtMs <= 0) return;
    lastRef.current = now;

    const list = pulseStateRef.current;
    for (const p of list) {
      // If currently turning, animate turn progress
      if (p.turning) {
        const deltaCells = (p.speed * dtMs) / 1000;
        p.turning.turnProgress += deltaCells;
        if (p.turning.turnProgress >= 1) {
          // Finish turn: snap to new direction and cell
          p.dir = p.turning.toDir;
          p.forward = p.turning.toForward;
          if (p.dir === 0) {
            p.x += p.forward ? 1 : -1;
            if (p.x < 0) p.x = cols - 1;
            if (p.x >= cols) p.x = 0;
          } else {
            p.y += p.forward ? 1 : -1;
            if (p.y < 0) p.y = rows - 1;
            if (p.y >= rows) p.y = 0;
          }
          p.progress = 0;
          p.turning = undefined;
        }
        continue;
      }

      // Not turning: move forward
      const deltaCells = (p.speed * dtMs) / 1000;
      p.progress += deltaCells;
      if (p.progress >= 1) {
        p.progress = 0;
        // At intersection: decide to turn?
        if (Math.random() < turnChance) {
          // Turn 90deg: pick left or right
          const turnLeft = Math.random() < 0.5;
          // New direction: swap axis
          const toDir: PulseDir = p.dir === 0 ? 1 : 0;
          // New forward: depends on left/right and current forward
          // (0: horizontal, 1: vertical)
          // Turning left: (x+,y+) -> (y-,x+), (x-,y-) -> (y+,x-)
          // Turning right: (x+,y+) -> (y+,x+), (x-,y-) -> (y-,x-)
          let toForward: boolean;
          if (turnLeft) {
            toForward = p.dir === 0 ? !p.forward : p.forward;
          } else {
            toForward = p.dir === 0 ? p.forward : !p.forward;
          }
          // Start turning
          p.turning = {
            toDir,
            toForward,
            turnProgress: 0,
            turnLeft,
          };
          continue;
        }
        // No turn: move forward
        if (p.dir === 0) {
          p.x += p.forward ? 1 : -1;
          if (p.x < 0) p.x = cols - 1;
          if (p.x >= cols) p.x = 0;
        } else {
          p.y += p.forward ? 1 : -1;
          if (p.y < 0) p.y = rows - 1;
          if (p.y >= rows) p.y = 0;
        }
      }
    }
    // Throttle re-render to ~30fps
    accumRef.current += dtMs;
    if (accumRef.current >= 33) {
      accumRef.current = 0;
      forceRerender();
    }
  });

  // Derived sizing (percentage grid)
  const cellW = 100 / (cols + 1);
  const cellH = 100 / (rows + 1);

  return (
    <div
      dir="ltr"
      className={twMerge(
        "pointer-events-none absolute inset-0 select-none [contain:layout_paint]",
        className
      )}
      style={style}
      aria-hidden>
      {/* Grid lines */}
      <div className="absolute inset-0">
        {hLines.map((_, i) => (
          <div
            key={"h" + i}
            className="absolute left-0 w-full border-t border-dashed"
            style={{
              top: `${((i + 1) / (rows + 1)) * 100}%`,
              borderColor: colorLine,
              opacity: 0.55,
            }}
          />
        ))}
        {vLines.map((_, i) => (
          <div
            key={"v" + i}
            className="absolute top-0 h-full border-l border-dashed"
            style={{
              left: `${((i + 1) / (cols + 1)) * 100}%`,
              borderColor: colorLine,
              opacity: 0.55,
            }}
          />
        ))}
      </div>

      {/* Pulses */}
      <div className="absolute inset-0">
        {pulseStateRef.current.map((p) => {
          // Pulse visual parameters
          const sizeLong = 70; // px length of pulse trail
          const sizeShort = 6; // px thickness

          // If turning, animate along a quarter-circle arc
          if (p.turning) {
            // Determine center of the turn (intersection point)
            const fromDir = p.dir;
            const fromForward = p.forward;
            const toDir = p.turning.toDir;
            const toForward = p.turning.toForward;
            const turnLeft = p.turning.turnLeft;
            const t = Math.min(p.turning.turnProgress, 1);

            // The cell the turn starts from
            const cx = p.x;
            const cy = p.y;

            // Calculate arc center offset and start/end angles
            // Grid cell size in percent
            const cellWpx = cellW;
            const cellHpx = cellH;

            // For percent-based grid, we need to convert to px for arc math, so we use percent as pseudo-px
            // The arc is a quarter circle of radius cellW/cellH (depending on direction)
            // The arc center is at the intersection, offset by half a cell in both axes depending on turn direction
            // We'll use a simple mapping for 4 possible turn cases

            // Map direction/forward/turnLeft to arc center and angles
            // 0: horizontal, 1: vertical
            // forward: true (increasing), false (decreasing)
            // turnLeft: true (left), false (right)

            // Calculate the center of the arc (in grid coordinates)
            let arcCenterX = cx;
            let arcCenterY = cy;
            let startAngle = 0;
            let endAngle = 0;
            let radiusW = cellW;
            let radiusH = cellH;

            if (fromDir === 0 && fromForward) {
              // Moving right
              if (turnLeft) {
                // Up
                arcCenterX = cx + 1;
                arcCenterY = cy;
                startAngle = 0;
                endAngle = -90;
              } else {
                // Down
                arcCenterX = cx + 1;
                arcCenterY = cy + 1;
                startAngle = 0;
                endAngle = 90;
              }
            } else if (fromDir === 0 && !fromForward) {
              // Moving left
              if (turnLeft) {
                // Down
                arcCenterX = cx;
                arcCenterY = cy + 1;
                startAngle = 180;
                endAngle = 90;
              } else {
                // Up
                arcCenterX = cx;
                arcCenterY = cy;
                startAngle = 180;
                endAngle = 270;
              }
            } else if (fromDir === 1 && fromForward) {
              // Moving down
              if (turnLeft) {
                // Right
                arcCenterX = cx;
                arcCenterY = cy + 1;
                startAngle = 90;
                endAngle = 0;
              } else {
                // Left
                arcCenterX = cx - 1 + 1;
                arcCenterY = cy + 1;
                startAngle = 90;
                endAngle = 180;
              }
            } else if (fromDir === 1 && !fromForward) {
              // Moving up
              if (turnLeft) {
                // Left
                arcCenterX = cx;
                arcCenterY = cy;
                startAngle = 270;
                endAngle = 180;
              } else {
                // Right
                arcCenterX = cx + 1;
                arcCenterY = cy;
                startAngle = 270;
                endAngle = 360;
              }
            }

            // Interpolate angle
            const angle = startAngle + (endAngle - startAngle) * t;
            const rad = (angle * Math.PI) / 180;
            // Arc radius in percent
            const rW = cellW;
            const rH = cellH;
            // Arc center in percent
            const centerLeft = arcCenterX * cellW + cellW;
            const centerTop = arcCenterY * cellH + cellH;
            // Position along arc
            const left = centerLeft + Math.cos(rad) * rW;
            const top = centerTop + Math.sin(rad) * rH;

            // For visual, rotate the pulse to match tangent
            const tangentAngle = angle + (turnLeft ? -90 : 90);

            return (
              <motion.div
                key={p.id}
                className={twMerge(
                  "absolute",
                  "rounded-full",
                  "transition-all duration-200",
                  "[transition-property:background,box-shadow,filter]"
                )}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: sizeLong,
                  height: sizeShort,
                  translateX: `-${sizeLong / 2}px`,
                  translateY: `-${sizeShort / 2}px`,
                  background: `linear-gradient(90deg, ${colorGlow} 0%, ${colorGlow} 40%, transparent 100%)`,
                  filter: "drop-shadow(0 0 4px var(--tw-shadow-color))",
                  boxShadow: `0 0 4px 1px ${colorGlow}, 0 0 12px 2px ${colorGlow}66`,
                  opacity: 0.9,
                  borderRadius: sizeShort,
                  rotate: `${tangentAngle}deg`,
                  transition: "border-radius 0.2s cubic-bezier(.4,2,.6,1)",
                }}
              />
            );
          }

          // Not turning: straight segment
          const left = (p.x + (p.dir === 0 ? p.progress : 0)) * cellW + cellW;
          const top = (p.y + (p.dir === 1 ? p.progress : 0)) * cellH + cellH;
          const isH = p.dir === 0;
          return (
            <motion.div
              key={p.id}
              className={twMerge("absolute rounded-full", isH ? "" : "")}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: isH ? sizeLong : sizeShort,
                height: isH ? sizeShort : sizeLong,
                translateX: isH ? `-${sizeLong / 2}px` : `-${sizeShort / 2}px`,
                translateY: isH ? `-${sizeShort / 2}px` : `-${sizeLong / 2}px`,
                background: `linear-gradient(${
                  isH ? 90 : 180
                }deg, ${colorGlow} 0%, ${colorGlow} 40%, transparent 100%)`,
                filter: "drop-shadow(0 0 4px var(--tw-shadow-color))",
                boxShadow: `0 0 4px 1px ${colorGlow}, 0 0 12px 2px ${colorGlow}66`,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MotionGridFlowBackground;

/**
 * Usage Example:
 * <div className="relative w-full h-[500px] bg-black">
 *   <MotionGridFlowBackground rows={8} cols={8} pulseCount={12} colorGlow="#6366f1" />
 * </div>
 */
