"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderFeedbackView } from "@/types/order";

const STARS = [1, 2, 3, 4, 5];

function draftReviewText(restaurantName: string): string {
  return `Had a great time at ${restaurantName}! The food was delicious and the service was quick. Would definitely recommend and come back again.`;
}

export function FeedbackForm({
  orderId,
  existingFeedback,
  restaurantName = "Garden Cafe",
  googleReviewLink,
  onSubmitted,
}: {
  orderId: string;
  existingFeedback?: OrderFeedbackView | null;
  restaurantName?: string;
  googleReviewLink?: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const draft = useMemo(() => draftReviewText(restaurantName), [restaurantName]);
  const finalRating = existingFeedback?.rating ?? submittedRating;
  const showReviewPrompt = googleReviewLink && finalRating != null && finalRating >= 4;

  async function handleSubmit() {
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit feedback");
      setSubmittedRating(rating);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable (http, permissions) — the text is still
      // selectable and the "Leave a review" link still works either way.
    }
  }

  if (existingFeedback || submittedRating != null) {
    const rating = existingFeedback?.rating ?? submittedRating!;
    return (
      <div className="space-y-3 rounded-xl border border-border bg-white p-4 text-center">
        <p className="text-sm text-ink/50">Thanks for your feedback!</p>
        <p className="text-lg text-amber-500">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </p>

        {showReviewPrompt && (
          <div className="space-y-2 rounded-xl bg-primary-light p-3 text-left">
            <p className="text-sm font-medium text-primary">Loved it? Share a quick Google review.</p>
            <p className="rounded-lg bg-white p-2.5 text-xs text-ink/70">{draft}</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleCopyDraft}>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                {copied ? "Copied!" : "Copy text"}
              </Button>
              <a href={googleReviewLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button type="button" size="sm" className="w-full">
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                  Leave a review
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4">
      <h2 className="font-display text-sm font-semibold text-ink">How was your meal?</h2>

      <div className="flex justify-center gap-1 text-3xl">
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={cn("transition-colors", star <= rating ? "text-amber-500" : "text-cream-soft")}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Anything you'd like to tell us? (optional)"
        className="w-full rounded-lg border border-border p-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="button" className="w-full" isLoading={isSubmitting} onClick={handleSubmit}>
        Submit feedback
      </Button>
    </div>
  );
}
