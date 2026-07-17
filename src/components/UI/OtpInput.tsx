import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  /** Fired once the full code is entered (e.g. on paste). */
  onComplete?: (value: string) => void;
}

/**
 * Boxed one-time-code input — one square per digit, with auto-advance,
 * backspace-to-previous, arrow navigation and full paste support.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  hasError = false,
  disabled = false,
  onComplete,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const emit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1); // keep last typed digit
    const arr = chars.slice();
    arr[index] = digit;
    emit(arr.join(""));
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = chars.slice();
      if (chars[index]) {
        arr[index] = "";
        emit(arr.join(""));
      } else if (index > 0) {
        arr[index - 1] = "";
        emit(arr.join(""));
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    emit(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={c}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-10 h-11 sm:w-11 sm:h-12 rounded-xl border text-center text-lg primary-font text-gray-900 shadow-sm transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:-translate-y-0.5",
            hasError
              ? "border-red-400 bg-red-50/40 focus:border-red-500"
              : c
              ? "border-primary/60 bg-white"
              : "border-gray-200 bg-gray-50 focus:border-primary focus:bg-white"
          )}
        />
      ))}
    </div>
  );
}

export default OtpInput;
