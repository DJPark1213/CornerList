import { Review } from "@/types/dj";

type Props = {
  reviews: Review[];
};

export default function DjReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        <p className="mt-2 text-sm text-muted">No reviews yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">
        Reviews{" "}
        <span className="text-sm font-normal text-muted">
          ({reviews.length})
        </span>
      </h2>

      <div className="mt-4 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {review.hostDisplayName}
              </span>
              <span className="text-xs text-muted">{review.createdAt}</span>
            </div>
            <div className="mt-1 text-sm text-star">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
