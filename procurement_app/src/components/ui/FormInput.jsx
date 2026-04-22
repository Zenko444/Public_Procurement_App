import React, { forwardRef } from "react";

const FormInput = forwardRef(function FormInput(
  { label, error, readOnly, icon: Icon, ...props },
  ref
) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-lg font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        <input
          ref={ref}
          {...props}
          readOnly={readOnly}
          className={`
            w-full h-12 rounded-xl border text-lg font-extralight text-slate-800 
            placeholder:text-slate-400 transition-all
            ${Icon ? "pl-12 pr-4" : "px-4"}
            ${
              readOnly
                ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500"
                : "bg-white border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue"
            }
            ${error ? "border-red-300 focus:ring-red-200 focus:border-red-400" : ""}
          `}
        />
      </div>
      {error && (
        <p className="text-lg text-red-500 font-extralight">{error}</p>
      )}
    </div>
  );
});

export default FormInput;
