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
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white sm:size-[22px] 2xl:size-[27px]">
        <span className="size-2.5 rounded-full bg-verde-escuro-500 2xl:size-3.5" />
      </span>
    );
  }

  if (visual === "wrong-selected") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white sm:size-[22px] 2xl:size-[27px]">
        <span className="size-2.5 rounded-full bg-red-600 2xl:size-3.5" />
      </span>
    );
  }

  const borderClass =
    visual === "wrong"
      ? "border-red-500"
      : visual === "selected"
        ? "border-verde-500 bg-verde-500"
        : "border-neutral-300";

  return (
    <span
      className={cn(
        "size-5 shrink-0 rounded-full border-2 sm:size-[22px] 2xl:size-[27px]",
        borderClass,
      )}
    />
  );
}

function ResultBadge({ visual }: { visual: QuizOptionVisual }) {
  if (visual === "correct" || visual === "correct-selected") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-verde-100 px-2 py-0.5 text-[10px] font-medium text-verde-100 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs lg:text-sm 2xl:gap-2 2xl:px-10 2xl:py-1.5 2xl:text-base">
        <CheckCircle2 className="size-3 sm:size-3.5 2xl:size-[18px]" aria-hidden />
        <span className="sm:hidden">Correta</span>
        <span className="hidden sm:inline">Resposta Correta</span>
      </span>
    );
  }

  if (visual === "wrong" || visual === "wrong-selected") {
    const inverted = visual === "wrong-selected";
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-pill border px-2 py-0.5 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs lg:text-sm 2xl:gap-2 2xl:px-10 2xl:py-1.5 2xl:text-base",
          inverted
            ? "border-[#ffeaea] text-[#ffeaea]"
            : "border-red-500 text-red-500",
        )}
      >
        <OctagonX className="size-3 sm:size-3.5 2xl:size-5" aria-hidden />
        <span className="hidden sm:inline">Resposta Errada</span>
        <span className="sm:hidden">Errada</span>
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
    "flex w-full min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-left transition-all sm:min-h-[50px] sm:gap-3 sm:px-4 sm:py-2.5 lg:min-h-[56px] 2xl:min-h-[86px] 2xl:gap-6 2xl:px-6 2xl:py-4",
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
    "min-w-0 flex-1 text-sm leading-snug sm:text-base lg:text-lg 2xl:text-2xl",
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
