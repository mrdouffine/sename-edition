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

  const baseClass = "relative pt-4 text-[0.65rem] font-bold uppercase tracking-widest transition-all";
  const activeClass = "text-[#181810] before:absolute before:top-0 before:left-1/4 before:w-1/2 before:h-[2px] before:bg-[#EE7455]";
  const inactiveClass = "text-[#a3a3a3] hover:text-[#666]";

  return (
    <div className="mt-8">
      <div className="mb-8 flex justify-center gap-10 border-t border-[#e5e5e0]">
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
