"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api/client";
import { type StaticReview } from "@/models/Book";

type CommentItem = {
  id: string;
  rating: number;
  content: string;
  authorReply?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  user: { id: string; name?: string } | null;
};

type ApiResult<T> = { data?: T; error?: string };
type ProfileResponse = {
  data?: { name?: string; email?: string; role?: "client" | "admin" };
  error?: string;
};

type BookCommentsSectionProps = {
  bookId: string;
  mode?: "full" | "formOnly";
  staticReviews?: StaticReview[];
};

export default function BookCommentsSection({
  bookId,
  mode = "full",
  staticReviews = []
}: BookCommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"client" | "admin" | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/comments?bookId=${bookId}`);
      const payload = (await response.json()) as ApiResult<CommentItem[]>;
      if (!response.ok) {
        setError(payload.error ?? "Impossible de charger les commentaires");
        return;
      }
      setComments(payload.data ?? []);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (mode !== "full") {
      setLoading(false);
      return;
    }
    void loadComments();
  }, [loadComments, mode]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetchWithAuth("/api/me/profile");
        const payload = (await response.json()) as ProfileResponse;
        if (!response.ok || !payload.data) {
          return;
        }
        if (!isMounted) return;
        setName(payload.data.name ?? "");
        setEmail(payload.data.email ?? "");
        setRole(payload.data.role ?? null);
      } catch {
        // ignore
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submitComment() {
    setSubmitting(true);
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      if (!trimmedName || !trimmedEmail) {
        setError("Nom et email sont obligatoires.");
        return;
      }

      const response = await fetchWithAuth("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          rating,
          content,
          reviewerName: trimmedName,
          reviewerEmail: trimmedEmail
        })
      });

      const payload = (await response.json()) as ApiResult<unknown>;
      if (!response.ok) {
        setError(payload.error ?? "Impossible d'ajouter le commentaire");
        return;
      }

      setContent("");
      setRating(5);
      setError("Commentaire envoyé. Il est visible immédiatement.");
      void loadComments();
    } finally {
      setSubmitting(false);
    }
  }

  // Combine static reviews and user comments
  const allReviews = useMemo(() => {
    const sortedStatic = [...staticReviews].sort((a, b) => a.order - b.order);
    return [
      ...sortedStatic.map((review) => ({
        id: `static-${review.order}`,
        rating: review.rating,
        content: review.content,
        authorReply: undefined,
        reviewerName: review.name,
        reviewerEmail: undefined,
        user: null,
        isStatic: true as const,
        role: review.role
      })),
      ...comments
    ];
  }, [staticReviews, comments]);

  const avg = useMemo(() => {
    if (!allReviews.length) return 0;
    return allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  }, [allReviews]);

  return (
    <section className="space-y-10">
      {mode === "full" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8d895e]">
            {allReviews.length} avis • Note moyenne {avg.toFixed(1)}/5
          </p>
          {error ? (
            <p className="rounded border border-[#e5e5e0] bg-white px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}
        </div>
      ) : error ? (
        <p className="rounded border border-[#e5e5e0] bg-white px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      {mode === "full" && loading ? (
        <p className="text-sm text-[#8d895e]">Chargement...</p>
      ) : null}

      {mode === "full" ? (
        <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
          {allReviews.map((review) => {
            const nameLabel = review.reviewerName || review.user?.name || "Lecteur";
            const initial = nameLabel.trim().charAt(0).toUpperCase();
            return (
              <article key={review.id} className="flex flex-col">
                <div className="relative rounded-xl bg-primary p-6">
                  <p className="font-medium leading-relaxed text-[#181810]">
                    &ldquo;{review.content}&rdquo;
                  </p>
                  <div className="absolute -bottom-4 left-6 h-0 w-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-primary"></div>
                </div>
                <div className="ml-2 mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#e5e5e0] text-sm font-bold text-[#181810]">
                    {initial || "L"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold">{nameLabel}</h4>
                      {(review as any).role && (
                        <span className="text-xs text-[#8d895e]">- {(review as any).role}</span>
                      )}
                    </div>
                    <div className="flex origin-left scale-75 text-black">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={`${review.id}-star-${index}`}
                          className={`material-symbols-outlined text-xs ${
                            index < review.rating ? "fill-1" : ""
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {review.authorReply ? (
                  <div className="mt-4 rounded-lg border border-[#e5e5e0] bg-white px-4 py-3 text-sm text-[#181810]">
                    <span className="font-bold">Réponse de l&apos;auteur:</span>{" "}
                    {review.authorReply}
                  </div>
                ) : null}
              </article>
            );
          })}

          {!allReviews.length && !loading ? (
            <p className="text-sm text-[#8d895e]">Aucun avis pour le moment.</p>
          ) : null}
        </div>
      ) : null}

      <section className="border-t border-[#e5e5e0] pt-16">
        <div className="max-w-2xl">
          <h3 className="mb-8 text-2xl font-black uppercase tracking-tight text-[#181810]">
            Laissez votre avis
          </h3>
          {role === "admin" ? (
            <p className="mb-4 rounded border border-[#e5e5e0] bg-white px-3 py-2 text-sm text-[#6b6959]">
              Les comptes administrateurs ne peuvent pas publier d&apos;avis.
            </p>
          ) : null}
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void submitComment();
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8d895e]">
                Note
              </label>
              <div className="flex gap-1 text-[#181810]">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={`rating-${value}`}
                      type="button"
                      onClick={() => setRating(value)}
                      disabled={role === "admin"}
                      className={`material-symbols-outlined transition-colors ${
                        role === "admin" ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        value <= rating ? "fill-1 text-primary" : "text-[#181810]"
                      }`}
                    >
                      star
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-[#8d895e]"
                  htmlFor="reviewer-name"
                >
                  Nom
                </label>
                <input
                  id="reviewer-name"
                  className="rounded-lg border-2 border-[#e5e5e0] bg-white px-4 py-3 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Votre nom"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={role === "admin"}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-[#8d895e]"
                  htmlFor="reviewer-email"
                >
                  Email
                </label>
                <input
                  id="reviewer-email"
                  className="rounded-lg border-2 border-[#e5e5e0] bg-white px-4 py-3 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="votre@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={role === "admin"}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-[#8d895e]"
                htmlFor="reviewer-comment"
              >
                Votre commentaire
              </label>
              <textarea
                id="reviewer-comment"
                className="rounded-lg border-2 border-[#e5e5e0] bg-white px-4 py-3 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Partagez votre expérience..."
                rows={5}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={role === "admin"}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={
                role === "admin" ||
                submitting ||
                content.trim().length < 2 ||
                name.trim().length < 2 ||
                email.trim().length < 3
              }
              className="h-14 rounded-lg bg-primary px-10 text-sm font-black uppercase tracking-widest text-black shadow-md transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Publier l'avis"}
            </button>
          </form>
        </div>
      </section>
    </section>
  );
}
