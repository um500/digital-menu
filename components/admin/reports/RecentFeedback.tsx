import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { ReportSummaryView } from "@/types/report";

export function RecentFeedback({ report }: { report: ReportSummaryView }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-sm font-semibold text-ink">Recent feedback</h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {report.recentFeedback.length === 0 ? (
          <p className="text-sm text-ink/40">No feedback in this range yet.</p>
        ) : (
          report.recentFeedback.map((fb, i) => (
            <div key={i} className="border-b border-border pb-2 last:border-0 last:pb-0">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">#{fb.orderNumber}</span>
                <span className="text-amber-500">
                  {"★".repeat(fb.rating)}
                  {"☆".repeat(5 - fb.rating)}
                </span>
              </div>
              {fb.comment && <p className="mt-0.5 text-sm text-ink/60">{fb.comment}</p>}
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
