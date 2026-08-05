"use client";

import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type CreatorVideo = {
  id: number;
  creator: string;
  image: string;
  title: string;
};

const creatorVideos: CreatorVideo[] = [
  {
    id: 1,
    creator: "@lovely_yetzy",
    image: "/images/social/summer-fashion.svg",
    title: "Summer fashion collection",
  },
  {
    id: 2,
    creator: "@AA",
    image: "/images/social/hair-care.svg",
    title: "Reward planner and daily organisation",
  },
  {
    id: 3,
    creator: "@Airmenty",
    image: "/images/social/tech-creator.svg",
    title: "Comfortable matching fashion set",
  },
  {
    id: 4,
    creator: "@ShuangYu",
    image: "/images/social/home-creator.svg",
    title: "Helpful home and family products",
  },
  {
    id: 5,
    creator: "@fit_with_ange",
    image: "/images/social/sports-fashion.svg",
    title: "Trending sportswear collection",
  },
  {
    id: 6,
    creator: "@beauty_by_ella",
    image: "/images/social/hair-care.svg",
    title: "Creator-approved beauty favourites",
  },
];

export default function CreatorVideoStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  const [playingIds, setPlayingIds] = useState<number[]>([]);
  const [mutedIds, setMutedIds] = useState<number[]>(
    creatorVideos.map((item) => item.id),
  );
  const [captionIds, setCaptionIds] = useState<number[]>([]);

  const slide = (
    direction: "previous" | "next",
  ) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left:
        direction === "next"
          ? track.clientWidth * 0.9
          : -track.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  const toggleItem = (
    id: number,
    values: number[],
    setter: React.Dispatch<
      React.SetStateAction<number[]>
    >,
  ) => {
    setter(
      values.includes(id)
        ? values.filter((itemId) => itemId !== id)
        : [...values, id],
    );
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
              Creator videos
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              See products in real life
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Watch how creators use their favourite RushPi products.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => slide("previous")}
              className="grid size-11 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Previous creator videos"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => slide("next")}
              className="grid size-11 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Next creator videos"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="creator-video-track"
          >
            {creatorVideos.map((video) => {
              const isPlaying =
                playingIds.includes(video.id);

              const isMuted =
                mutedIds.includes(video.id);

              const captionsEnabled =
                captionIds.includes(video.id);

              return (
                <article
                  key={video.id}
                  className="creator-video-card group relative isolate overflow-hidden bg-slate-900"
                >
                  <Image
                    src={video.image}
                    alt={video.title}
                    fill
                    className={`object-cover transition duration-700 ${
                      isPlaying
                        ? "scale-[1.04]"
                        : "group-hover:scale-[1.03]"
                    }`}
                    sizes="(max-width: 767px) 84vw, (max-width: 1279px) 45vw, 24vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/5" />

                  {captionsEnabled && (
                    <div className="absolute inset-x-5 bottom-20 z-20 bg-black/75 px-3 py-2 text-center text-xs font-semibold text-white backdrop-blur-sm">
                      {video.title}
                    </div>
                  )}

                  <p className="absolute bottom-5 left-5 z-20 max-w-[55%] truncate text-sm font-medium text-white sm:text-base">
                    {video.creator}
                  </p>

                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleItem(
                          video.id,
                          playingIds,
                          setPlayingIds,
                        )
                      }
                      className="grid size-8 place-items-center rounded-full bg-white/85 text-slate-950 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white"
                      aria-label={
                        isPlaying
                          ? "Pause creator video"
                          : "Play creator video"
                      }
                    >
                      {isPlaying ? (
                        <Pause className="size-4 fill-current" />
                      ) : (
                        <Play className="size-4 fill-current" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleItem(
                          video.id,
                          mutedIds,
                          setMutedIds,
                        )
                      }
                      className="grid size-8 place-items-center rounded-full bg-white/85 text-slate-950 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white"
                      aria-label={
                        isMuted
                          ? "Unmute creator video"
                          : "Mute creator video"
                      }
                    >
                      {isMuted ? (
                        <VolumeX className="size-4" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleItem(
                          video.id,
                          captionIds,
                          setCaptionIds,
                        )
                      }
                      className={`grid size-8 place-items-center rounded-full shadow-md backdrop-blur transition hover:scale-110 ${
                        captionsEnabled
                          ? "bg-blue-600 text-white"
                          : "bg-white/85 text-slate-950 hover:bg-white"
                      }`}
                      aria-label="Toggle captions"
                    >
                      <Captions className="size-4" />
                    </button>
                  </div>

                  {isPlaying && (
                    <span className="absolute left-4 top-4 z-20 flex items-center gap-2 bg-red-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                      <span className="size-2 animate-pulse rounded-full bg-white" />
                      Playing
                    </span>
                  )}
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => slide("previous")}
            className="absolute left-3 top-1/2 z-30 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-950 shadow-xl transition hover:scale-110 hover:bg-slate-950 hover:text-white lg:grid"
            aria-label="Previous creator videos"
          >
            <ChevronLeft className="size-6" />
          </button>

          <button
            type="button"
            onClick={() => slide("next")}
            className="absolute right-3 top-1/2 z-30 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-950 shadow-xl transition hover:scale-110 hover:bg-slate-950 hover:text-white"
            aria-label="Next creator videos"
          >
            <ChevronRight className="size-7" />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => slide("previous")}
            className="grid size-10 place-items-center rounded-full border border-slate-300 bg-white"
            aria-label="Previous creator videos"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => slide("next")}
            className="grid size-10 place-items-center rounded-full border border-slate-300 bg-white"
            aria-label="Next creator videos"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
