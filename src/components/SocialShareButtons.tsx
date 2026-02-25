"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
  className?: string;
};

export default function SocialShareButtons({ title, className }: Props) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={className}>
      <a
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e0] transition-all hover:bg-primary hover:text-black"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Partager sur Facebook"
      >
        <span className="text-xs font-bold">f</span>
      </a>
      <a
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e0] transition-all hover:bg-primary hover:text-black"
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Partager sur X"
      >
        <span className="text-xs font-bold">x</span>
      </a>
      <a
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e0] transition-all hover:bg-primary hover:text-black"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Partager sur LinkedIn"
      >
        <span className="text-[10px] font-bold">in</span>
      </a>
      <a
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e0] transition-all hover:bg-primary hover:text-black"
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Partager sur WhatsApp"
      >
        <span className="text-[10px] font-bold">wa</span>
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-full border border-[#e5e5e0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition hover:bg-primary"
      >
        {copied ? "Copié" : "Copier lien"}
      </button>
    </div>
  );
}
