"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL || "";

interface SpriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  duration: number;
}

interface SpriteData {
  frames: SpriteFrame[];
  meta: { image: string; size: { w: number; h: number } };
}

function normalizeFrames(raw: Record<string, unknown>): SpriteData {
  const meta = raw.meta as SpriteData["meta"];
  let frames: SpriteFrame[];
  if (Array.isArray(raw.frames)) {
    frames = raw.frames;
  } else {
    frames = Object.values(raw.frames as Record<string, SpriteFrame>);
  }
  return { frames, meta };
}

interface VotiSpriteProps {
  sprite: string;
  width?: number;
  loop?: boolean;
  playing?: boolean;
  onHoverSprite?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function VotiSprite({
  sprite,
  width = 400,
  loop = true,
  playing = true,
  onHoverSprite,
  className = "",
  style,
}: VotiSpriteProps) {
  const [data, setData] = useState<SpriteData | null>(null);
  const [hoverData, setHoverData] = useState<SpriteData | null>(null);
  const [frame, setFrame] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${ASSETS_URL}/sprites/${sprite}.json`)
      .then((r) => r.json())
      .then((raw) => setData(normalizeFrames(raw)))
      .catch(() => {});
  }, [sprite]);

  useEffect(() => {
    if (!onHoverSprite) return;
    fetch(`/sprites/${onHoverSprite}.json`)
      .then((r) => r.json())
      .then((raw) => setHoverData(normalizeFrames(raw)))
      .catch(() => {});
  }, [onHoverSprite]);

  const activeData = isHovered && hoverData ? hoverData : data;
  const activeSprite = isHovered && onHoverSprite ? onHoverSprite : sprite;

  const animate = useCallback(() => {
    if (!activeData || !playing) return;
    const totalFrames = activeData.frames.length;

    timerRef.current = setTimeout(() => {
      setFrame((prev) => {
        const next = prev + 1;
        if (next >= totalFrames) return loop ? 0 : prev;
        return next;
      });
      animate();
    }, activeData.frames[frame]?.duration ?? 150);
  }, [activeData, frame, loop, playing]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (playing && activeData) animate();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [animate, playing, activeData]);

  useEffect(() => {
    setFrame(0);
  }, [isHovered]);

  if (!activeData) return <div style={{ width, height: width * 1.33 }} />;

  const frameW = activeData.frames[0].frame.w;
  const frameH = activeData.frames[0].frame.h;
  const scale = width / frameW;
  const height = frameH * scale;
  const sheetW = activeData.meta.size.w;
  const currentFrame = activeData.frames[Math.min(frame, activeData.frames.length - 1)];
  const offsetX = -(currentFrame.frame.x * scale);

  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={() => onHoverSprite && setIsHovered(true)}
      onMouseLeave={() => onHoverSprite && setIsHovered(false)}
    >
      <div
        style={{
          width: sheetW * scale,
          height,
          backgroundImage: `url(${ASSETS_URL}/sprites/${activeSprite}.png)`,
          backgroundSize: `${sheetW * scale}px ${height}px`,
          backgroundRepeat: "no-repeat",
          transform: `translateX(${offsetX}px)`,
          willChange: "transform",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
