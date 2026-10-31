"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Photo } from "../types";

const cardVariants = {
  gone: (dir: number) => ({ x: dir * 420, rotate: dir * 24, opacity: 0, transition: { duration: 0.4 } }),
};

/** A stack of instant-film prints. Swipe (or tap) the top one away to see the next. */
export function PhotoStack({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = (dir: number) => {
    setDirection(dir);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= photos.length) setTimeout(onDone, 450);
  };

  const visible = photos
    .map((photo, i) => ({ photo, i }))
    .slice(index, index + 3)
    .reverse();

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[4/5] w-[74cqw] max-w-[320px]">
        <AnimatePresence custom={direction}>
          {visible.map(({ photo, i }) => {
            const depth = i - index;
            const tilt = ((i * 37) % 11) - 5;
            const isTop = depth === 0;
            return (
              <motion.div
                key={i}
                custom={direction}
                className="absolute inset-0 cursor-grab rounded-[6px] bg-[#fffdf8] p-3 pb-16 shadow-2xl shadow-black/40 active:cursor-grabbing"
                style={{ zIndex: 10 - depth }}
                initial={{ scale: 0.9, opacity: 0, rotate: tilt }}
                animate={{ scale: 1 - depth * 0.04, y: depth * 10, rotate: isTop ? tilt * 0.4 : tilt, opacity: 1 }}
                variants={cardVariants}
                exit="gone"
                drag={isTop ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 450) next(info.offset.x > 0 ? 1 : -1);
                }}
                onTap={() => isTop && next(1)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- photos are already resized on upload */}
                <img
                  src={photo.url}
                  alt={photo.caption || "A shared memory"}
                  draggable={false}
                  className="h-full w-full rounded-[3px] object-cover"
                />
                <p className="absolute inset-x-3 bottom-3 truncate text-center font-hand text-2xl text-[#3a2430]">
                  {photo.caption}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="mt-7 text-sm text-white/70">
        {Math.min(index + 1, photos.length)} / {photos.length} · swipe or tap
      </p>
    </div>
  );
}
