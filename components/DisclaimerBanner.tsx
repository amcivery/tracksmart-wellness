import { AlertTriangle } from "lucide-react";

export interface DisclaimerBannerProps {
  small?: boolean;
  className?: string;
  message?: string;
  fixed?: boolean;
}

const DISCLAIMER_TEXT =
  "This tool is for educational purposes only and is not medical advice. Always consult your doctor before making health changes. TrackSmart Wellness is not liable for any decisions based on these results.";

export default function DisclaimerBanner({
  small = false,
  className,
  message = DISCLAIMER_TEXT,
  fixed = true,
}: DisclaimerBannerProps) {
  const sizeClasses = small
    ? "bottom-3 left-3 right-3 px-3 py-2 text-xs sm:left-4 sm:right-4"
    : "bottom-4 left-4 right-4 px-4 py-3 text-sm sm:left-6 sm:right-6";

  return (
    <div
      role="alert"
      className={[
        fixed ? "fixed z-50" : "relative w-full",
        "rounded-2xl border border-red-400/40 bg-red-950/95 text-red-50 shadow-2xl shadow-red-950/40 backdrop-blur",
        fixed ? sizeClasses : small ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-200">
          <AlertTriangle className={small ? "h-4 w-4" : "h-5 w-5"} />
        </div>
        <p className={small ? "leading-5 text-red-50/95" : "leading-6 text-red-50"}>
          {message}
        </p>
      </div>
    </div>
  );
}
