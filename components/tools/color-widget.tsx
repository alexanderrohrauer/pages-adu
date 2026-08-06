import { ariaDescribedByIds, WidgetProps } from "@rjsf/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ColorWidget({
  id,
  htmlName,
  value,
  required,
  disabled,
  autofocus,
  readonly,
  onChange,
  onBlur,
  onFocus,
  className,
}: WidgetProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, e.target.value);
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, e.target.value);

  return (
    <div className="flex p-0.5">
      <Input
        id={id}
        name={htmlName || id}
        type="color"
        value={value || "#000000"}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        autoFocus={autofocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn("h-9 w-16 cursor-pointer p-1", className)}
        aria-describedby={ariaDescribedByIds(id)}
      />
    </div>
  );
}
