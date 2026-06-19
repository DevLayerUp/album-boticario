import { STICKER_FRAME } from "@/lib/sticker-card";

export function StickerFrameOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden
      style={{
        borderRadius: STICKER_FRAME.borderRadius,
        border: `${STICKER_FRAME.borderWidth}px solid ${STICKER_FRAME.color}`,
      }}
    />
  );
}
