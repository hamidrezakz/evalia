"use client";
import styles from "./lines-glow.module.css";

export function LinesGlow({
  count = 5,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={styles.linesGlowRoot + (className ? " " + className : "")}
      aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.lineRow}>
          <div className={styles.glowAnim} />
        </div>
      ))}
    </div>
  );
}
