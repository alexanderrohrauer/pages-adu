import { useAui } from "@assistant-ui/react";
import { SparklesIcon } from "lucide-react";

interface StartScreenCardProps {
  suggestions: string[];
}

export function StartScreenCard(props: StartScreenCardProps) {
  const aui = useAui();

  return (
    <div className="border-border/50 bg-muted mx-4 flex max-w-md flex-col gap-3 rounded-2xl border p-5 text-sm shadow-(--shadow-float)">
      <div className="flex items-center gap-2">
        <SparklesIcon className="text-primary size-4" />
        <h2 className="text-foreground font-medium">Start a change-request</h2>
      </div>
      <p className="text-muted-foreground">
        Describe the outcome you want and why it matters — sharing the goal, not
        just the instruction, gets you a better result. You can also attach a
        reference image or draw a quick sketch to show style or layout.
      </p>
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Try an example:
        </span>
        {props.suggestions.map((suggestion) => (
          <button
            className="border-border/60 bg-accent text-accent-foreground hover:bg-accent/20 rounded-lg border px-3 py-2 text-left text-xs transition-colors"
            key={suggestion}
            onClick={() => aui.composer().setText(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
