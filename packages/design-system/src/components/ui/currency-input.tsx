import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends React.ComponentProps<"input"> {
  label?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label = "Saldo atual", className, ...props }, ref) => {
    return (
      <div className="flex flex-col justify-center items-center p-0 gap-2">
        <Input
          ref={ref}
          type="text"
          className={cn("body-large-regular text-gray-6", className)}
          {...props}
        />
        {label && <span className="input-label text-gray-6">{label}</span>}
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
export type { CurrencyInputProps };
