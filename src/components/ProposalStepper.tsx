import { FileEdit, Send, CheckCircle2, XCircle, Wrench, DollarSign, Star } from "lucide-react";

interface StepperProposal {
  status: string;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  completed_at: string | null;
  payment_status: string;
  payment_received_at: string | null;
  review_request_sent_at: string | null;
  review_completed: boolean;
  review_completed_at: string | null;
}

type StepKey = "draft" | "sent" | "accepted" | "completed" | "paid" | "review" | "closed";

interface Step {
  key: StepKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { key: "draft", label: "Lead", icon: FileEdit },
  { key: "sent", label: "Sent", icon: Send },
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "completed", label: "Completed", icon: Wrench },
  { key: "paid", label: "Paid", icon: DollarSign },
  { key: "review", label: "Review", icon: Star },
  { key: "closed", label: "Closed", icon: CheckCircle2 },
];

export function getStepState(p: StepperProposal) {
  const isDeclined = p.status === "declined" || !!p.declined_at;
  const isSent = !!p.sent_at || p.status === "sent" || p.status === "accepted" || p.status === "declined" || !!p.accepted_at;
  const isAccepted = p.status === "accepted" || !!p.accepted_at;
  const isCompleted = !!p.completed_at;
  const isPaid = p.payment_status === "paid" || !!p.payment_received_at;
  const isReview = !!p.review_request_sent_at;
  const isClosed = isAccepted && isPaid && !!p.review_completed;

  const completed: Record<StepKey, boolean> = {
    draft: true,
    sent: isSent,
    accepted: isAccepted,
    completed: isCompleted,
    paid: isPaid,
    review: isReview,
    closed: isClosed,
  };

  let current: StepKey = "draft";
  if (isClosed) current = "closed";
  else if (isReview) current = "review";
  else if (isPaid) current = "paid";
  else if (isCompleted) current = "completed";
  else if (isAccepted) current = "accepted";
  else if (isSent) current = "sent";
  else current = "draft";

  return { completed, current, isDeclined, isClosed };
}

export const ProposalStepper = ({ proposal }: { proposal: StepperProposal }) => {
  const { completed, current, isDeclined } = getStepState(proposal);

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const isAcceptedSlot = step.key === "accepted";
          // Branch override: show "Declined" in the Accepted slot when declined
          const showDeclined = isDeclined && isAcceptedSlot;
          const Icon = showDeclined ? XCircle : step.icon;
          const label = showDeclined ? "Declined" : step.label;

          // Downstream of declined are muted
          const isDownstreamOfDeclined = isDeclined && idx > 2;

          const isDone = !isDownstreamOfDeclined && completed[step.key] && step.key !== current;
          const isCurrent = !isDownstreamOfDeclined && (showDeclined || step.key === current);
          const isFuture = !isDone && !isCurrent;

          let pillClasses = "border-border bg-muted/30 text-muted-foreground/60";
          if (showDeclined) {
            pillClasses = "border-destructive bg-destructive/15 text-destructive";
          } else if (isCurrent) {
            pillClasses = "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]";
          } else if (isDone) {
            pillClasses = "border-green-500/40 bg-green-500/10 text-green-500";
          }

          const connectorActive = !isDownstreamOfDeclined && completed[step.key] && idx > 0;
          const prevConnectorClass = connectorActive
            ? isDeclined && idx === 2
              ? "bg-destructive/50"
              : "bg-green-500/40"
            : "bg-border";

          return (
            <div key={step.key} className="flex flex-1 items-center gap-1 min-w-0">
              {idx > 0 && (
                <div className={`h-px flex-1 ${prevConnectorClass}`} />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap ${pillClasses}`}
                title={label}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalStepper;
