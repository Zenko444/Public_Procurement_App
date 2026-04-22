import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-baby-dark text-white hover:bg-baby-blue shadow-sm shadow-baby-dark/20",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",
  outline:
    "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ghost:
    "text-slate-600 hover:bg-slate-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-lg",
  md: "px-4 py-2.5 text-lg",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
        </>
      )}
    </button>
  );
}
