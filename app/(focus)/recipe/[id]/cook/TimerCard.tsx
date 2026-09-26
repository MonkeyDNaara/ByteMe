import { formatTimer, getRemainingSeconds, type StepTimer } from "@/lib/cookingTimers";

type TimerCardProps = {
  minutes: number;
  timer: StepTimer | undefined;
  now: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

/**
 * SVG progress ring: a circle whose stroke is a dash as long as the whole
 * circumference. Moving the dash's start (`stroke-dashoffset`) hides part of
 * it -- so offset = circumference × (1 − remaining / total).
 */
function Ring({ size, stroke, progress, completed }: { size: number; stroke: number; progress: number; completed: boolean }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-base-300" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={`motion-safe:transition-[stroke-dashoffset] motion-safe:duration-1000 motion-safe:ease-linear ${
          completed ? "stroke-success" : "stroke-link"
        }`}
      />
    </svg>
  );
}

const outlineButton =
  "btn h-12 rounded-full border-primary bg-base-100 px-5 text-base font-semibold hover:bg-primary/15";
const stopButton = "btn h-12 rounded-full border-error bg-base-100 px-5 text-base font-semibold text-error hover:bg-error/15";

export default function TimerCard({ minutes, timer, now, onStart, onPause, onResume, onStop }: TimerCardProps) {
  if (!timer) {
    return (
      <button type="button" onClick={onStart} className="btn btn-primary h-14 w-full rounded-full text-base font-bold">
        ▶ Start {minutes} min timer
      </button>
    );
  }

  const completed = timer.status === "completed";
  const remaining = getRemainingSeconds(timer, now);
  const progress = timer.durationSeconds > 0 ? remaining / timer.durationSeconds : 0;
  const digits = completed ? "Done!" : formatTimer(remaining);
  const total = `of ${formatTimer(timer.durationSeconds)} min`;

  const controls = completed ? (
    <button type="button" onClick={onStop} className={outlineButton}>
      ✓ Dismiss
    </button>
  ) : (
    <>
      {timer.status === "running" ? (
        <button type="button" onClick={onPause} className={outlineButton} aria-label="Pause timer">
          ⏸<span className="max-lg:sr-only"> Pause</span>
        </button>
      ) : (
        <button type="button" onClick={onResume} className={outlineButton} aria-label="Resume timer">
          ▶<span className="max-lg:sr-only"> Resume</span>
        </button>
      )}
      <button type="button" onClick={onStop} className={stopButton} aria-label="Stop timer">
        ■<span className="max-lg:sr-only"> Stop</span>
      </button>
    </>
  );

  return (
    <div className="rounded-[2rem] border border-base-300 bg-base-200 p-4 lg:p-7">
      {/* Phone: compact row */}
      <div className="flex items-center gap-4 lg:hidden">
        <Ring size={56} stroke={7} progress={progress} completed={completed} />
        <div className="flex flex-1 flex-col">
          <span className="font-mono text-3xl font-bold">{digits}</span>
          <span className="text-sm text-base-content/60">{total}</span>
        </div>
        {controls}
      </div>

      {/* Desktop: big ring with the digits inside */}
      <div className="hidden flex-col items-center gap-5 lg:flex">
        <div className="relative">
          <Ring size={200} stroke={14} progress={progress} completed={completed} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold">{digits}</span>
            <span className="text-sm text-base-content/60">{total}</span>
          </div>
        </div>
        <div className="flex gap-3">{controls}</div>
      </div>

      {/* Screen readers: announce state changes, not every second */}
      <span className="sr-only" aria-live="polite">
        {completed ? "Timer done" : timer.status === "paused" ? "Timer paused" : ""}
      </span>
    </div>
  );
}
