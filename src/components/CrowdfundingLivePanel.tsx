"use client";

import { useEffect, useMemo, useState } from "react";

type Snapshot = {
  bookId: string;
  title: string;
  goal: number;
  raised: number;
  progress: number;
  totalContributors: number;
  contributors: Array<{
    id: string;
    name: string;
    amount: number;
    reward?: string;
    createdAt?: string;
  }>;
};

export default function CrowdfundingLivePanel({
  bookId,
  initialGoal,
  initialRaised
}: {
  bookId: string;
  initialGoal: number;
  initialRaised: number;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const effective = useMemo(() => {
    if (snapshot) {
      return snapshot;
    }
    const progress = initialGoal > 0 ? Math.min((initialRaised / initialGoal) * 100, 100) : 0;
    return {
      bookId,
      title: "",
      goal: initialGoal,
      raised: initialRaised,
      progress,
      totalContributors: 0,
      contributors: []
    } as Snapshot;
  }, [bookId, initialGoal, initialRaised, snapshot]);

  useEffect(() => {
    const stream = new EventSource(`/api/contributions/stream?bookId=${encodeURIComponent(bookId)}`);

    stream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Snapshot;
        setSnapshot(data);
      } catch {
        // Ignore malformed events
      }
    };

    return () => {
      stream.close();
    };
  }, [bookId]);

  return (
    <div className="mt-4 rounded-xl border border-[#e5e5e0] bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-[#8d895e]">
        <span>{Math.round(effective.progress)}% financé</span>
        <span>{effective.raised.toFixed(0)}€ / {effective.goal.toFixed(0)}€</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e0]">
        <div className="h-full bg-primary" style={{ width: `${Math.min(100, effective.progress)}%` }} />
      </div>
      <p className="mt-3 text-xs text-[#6b6959]">
        Contributeurs publics: {effective.totalContributors}
      </p>
      {effective.contributors.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {effective.contributors.slice(0, 5).map((contributor) => (
            <li key={contributor.id} className="flex justify-between">
              <span className="font-semibold">{contributor.name}</span>
              <span>{contributor.amount.toFixed(2)}€</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
