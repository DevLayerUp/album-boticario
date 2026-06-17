import { CheckCircle2, OctagonX } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizOptionVisual =
  | "idle"
  | "selected"
  | "correct"
  | "correct-selected"
  | "wrong"
  | "wrong-selected";

interface QuizOptionRowProps {
  text: string;
  visual: QuizOptionVisual;
  onSelect?: () => void;
  disabled?: boolean;
}

function RadioMark({ visual }: { visual: QuizOptionVisual }) {
  if (visual === "correct" || visual === "correct-selected") {
    return (
      <span className="flex size-[27px] shrink-0 items-center justify-center rounded-full bg-white">
        <span className="size-3.5 rounded-full bg-verde-escuro-500" />
      </span>
    );
  }

  if (visual === "wrong-selected") {
    return (
      <span className="flex size-[27px] shrink-0 items-center justify-center rounded-full bg-white">
        <span className="size-3.5 rounded-full bg-red-600" />
      </span>
    );
  }

  const borderClass =
    visual === "wrong"
      ? "border-red-500"
      : visual === "selected"
        ? "border-verde-500 bg-verde-500"
        : "border-neutral-300";

  return <span className={cn("size-[27px] shrink-0 rounded-full border-2", borderClass)} />;
}

function ResultBadge({ visual }: { visual: QuizOptionVisual }) {
  if (visual === "correct" || visual === "correct-selected") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-verde-100 px-4 py-1.5 text-sm font-medium text-verde-100 sm:px-10 sm:text-base">
        <CheckCircle2 className="size-4 sm:size-[18px]" aria-hidden />
        Resposta Correta
      </span>
    );
  }

  if (visual === "wrong" || visual === "wrong-selected") {
    const inverted = visual === "wrong-selected";
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-pill border px-4 py-1.5 text-sm font-medium sm:px-10 sm:text-base",
          inverted
            ? "border-[#ffeaea] text-[#ffeaea]"
            : "border-red-500 text-red-500",
        )}
      >
        <OctagonX className="size-4 sm:size-5" aria-hidden />
        Resposta Errada
      </span>
    );
  }

  return null;
}

export function QuizOptionRow({
  text,
  visual,
  onSelect,
  disabled,
}: QuizOptionRowProps) {
  const isInteractive = Boolean(onSelect) && !disabled;
  const showBadge =
    visual === "correct" ||
    visual === "correct-selected" ||
    visual === "wrong" ||
    visual === "wrong-selected";

  const rowClass = cn(
    "flex w-full min-h-[64px] items-center gap-4 rounded-[10px] px-4 py-4 text-left transition-all sm:min-h-[86px] sm:gap-6 sm:px-6",
    visual === "idle" && "bg-white",
    visual === "selected" && "border border-verde-500 bg-verde-100",
    visual === "correct" && "border border-verde-100 bg-verde-500",
    visual === "correct-selected" && "border border-verde-100 bg-verde-500",
    visual === "wrong" && "border border-red-500 bg-[#ffeaea]",
    visual === "wrong-selected" && "border border-red-500 bg-red-600",
    isInteractive && visual === "idle" && "hover:bg-verde-100/40",
    isInteractive && "cursor-pointer",
    disabled && "cursor-default",
  );

  const textClass = cn(
    "min-w-0 flex-1 text-base sm:text-2xl",
    visual === "idle" || visual === "selected" ? "text-[#515151]" : "",
    visual === "correct" || visual === "correct-selected" ? "text-white" : "",
    visual === "wrong" ? "text-red-500" : "",
    visual === "wrong-selected" ? "text-[#ffeaea]" : "",
  );

  const content = (
    <>
      <RadioMark visual={visual} />
      <span className={textClass}>{text}</span>
      {showBadge ? <ResultBadge visual={visual} /> : null}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={visual === "selected"}
        onClick={onSelect}
        className={rowClass}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn(rowClass, showBadge && "flex-wrap sm:flex-nowrap")} role="listitem">
      {content}
    </div>
  );
}

export function resolveOptionVisual(
  optionId: number,
  selectedId: number | null,
  correctId: number | null,
  phase: "question" | "result",
): QuizOptionVisual {
  if (phase === "question") {
    return optionId === selectedId ? "selected" : "idle";
  }

  const isCorrect = optionId === correctId;
  const isSelected = optionId === selectedId;

  if (isCorrect && isSelected) return "correct-selected";
  if (isCorrect) return "correct";
  if (isSelected) return "wrong-selected";
  return "idle";
}
