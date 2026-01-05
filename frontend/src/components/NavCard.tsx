import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type NavCardProps = {
  title: string;
  to?: string;              // if provided => clickable
  disabled?: boolean;
  icon?: ReactNode;
};

export function NavCard({ title, to, disabled, icon }: NavCardProps) {
  const navigate = useNavigate();
  const isDisabled = disabled || !to;

  const base =
    "w-full border rounded-lg p-6 text-center shadow-sm bg-white transition";
  const enabled =
    "hover:shadow-md hover:border-slate-300 cursor-pointer";
  const disabledCls =
    "opacity-50 cursor-not-allowed";

  return (
    <button
      type="button"
      className={`${base} ${isDisabled ? disabledCls : enabled}`}
      onClick={() => {
        if (!isDisabled && to) navigate(to);
      }}
      disabled={isDisabled}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className="font-medium text-slate-800">{title}</span>
      </div>
    </button>
  );
}
