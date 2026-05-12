import { Eye, EyeOff } from "lucide-react";

type PasswordToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
};

export function PasswordToggle({ isVisible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-6 w-6 items-center justify-center text-[#9c968f] transition hover:text-[#67615b]"
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
    </button>
  );
}
