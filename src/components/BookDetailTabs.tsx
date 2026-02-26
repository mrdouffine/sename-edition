"use client";

import { useState } from "react";
import BookCommentsSection from "@/components/BookCommentsSection";
import { type StaticReview } from "@/models/Book";

type BookDetailTabsProps = {
  description: string;
  bookId: string;
  staticReviews?: StaticReview[];
};

export default function BookDetailTabs({ description, bookId, staticReviews = [] }: BookDetailTabsProps) {
  const [tab, setTab] = useState<"description" | "avis">("avis");

  const baseClass =
    "relative pb-2 text-sm font-black uppercase tracking-widest transition-all";
  const activeClass = "text-[#181810] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-primary";
  const inactiveClass = "text-[#8d895e] hover:text-[#181810]";

  return (
    <div className="border-t border-[#e5e5e0]">
      <div className="mb-8 flex flex-wrap gap-4 pt-6 sm:gap-10">
        <button
          type="button"
          onClick={() => setTab("description")}
          className={`${baseClass} ${tab === "description" ? activeClass : inactiveClass}`}
          aria-pressed={tab === "description"}
        >
          DESCRIPTION
        </button>
        <button
          type="button"
          onClick={() => setTab("avis")}
          className={`${baseClass} ${tab === "avis" ? activeClass : inactiveClass}`}
          aria-pressed={tab === "avis"}
        >
          AVIS
        </button>
      </div>

      {tab === "description" ? (
        <div className="space-y-10">
          <div className="max-w-3xl text-[clamp(1rem,1.4vw,1.15rem)] leading-relaxed text-[#181810] space-y-4">
            {description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <BookCommentsSection bookId={bookId} mode="formOnly" staticReviews={staticReviews} />
        </div>
      ) : (
        <BookCommentsSection bookId={bookId} mode="full" staticReviews={staticReviews} />
      )}
    </div>
  );
}
