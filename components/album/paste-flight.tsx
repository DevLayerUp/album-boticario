"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { playPasteSound } from "@/lib/play-paste-sound";

export interface PasteFlightConfig {
  imageUrl: string;
  borderColor: string;
  from: DOMRectReadOnly;
  to: DOMRectReadOnly;
}

interface PasteFlightProps {
  config: PasteFlightConfig;
  onComplete: () => void;
}

/**
 * FLIP overlay: sticker flies from modal preview to album slot (arc + shadow + press).
 */
export function PasteFlight({ config, onComplete }: PasteFlightProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const completedRef = useRef(false);
  const { from, to, imageUrl, borderColor } = config;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!reduced) return;
    playPasteSound(0.2);
    completedRef.current = true;
    onComplete();
  }, [reduced, onComplete]);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  if (!mounted || reduced) return null;

  const midX = (from.left + to.left + (from.width - to.width) / 2) / 2;
  const arcLift = Math.min(120, Math.max(48, Math.abs(from.top - to.top) * 0.35 + 40));
  const midW = (from.width + to.width) / 2;
  const midH = (from.height + to.height) / 2;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <motion.div
        className="absolute overflow-hidden rounded-input border-[5px]"
        style={{
          borderColor,
          transformOrigin: "center center",
          willChange: "left, top, width, height, transform",
        }}
        initial={{
          left: from.left,
          top: from.top,
          width: from.width,
          height: from.height,
          boxShadow: "0 18px 48px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)",
          scaleX: 1.05,
          scaleY: 1.05,
          rotate: -5,
        }}
        animate={{
          left: [from.left, midX, to.left, to.left],
          top: [from.top, from.top - arcLift, to.top, to.top],
          width: [from.width, midW, to.width, to.width],
          height: [from.height, midH, to.height, to.height],
          rotate: [-5, 4, 0, 0],
          scaleX: [1.05, 1.02, 1, 1.02, 1],
          scaleY: [1.05, 1.02, 1, 0.94, 1],
          boxShadow: [
            "0 18px 48px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)",
            "0 28px 56px rgba(0,0,0,0.28), 0 8px 16px rgba(0,0,0,0.15)",
            "0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)",
            "0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)",
            "0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)",
          ],
          filter: [
            "brightness(1)",
            "brightness(1.05)",
            "brightness(1)",
            "brightness(1.3)",
            "brightness(1)",
          ],
        }}
        transition={{
          duration: 0.88,
          times: [0, 0.42, 0.72, 0.84, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={() => {
          playPasteSound();
          finish();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
      </motion.div>
    </div>,
    document.body,
  );
}
