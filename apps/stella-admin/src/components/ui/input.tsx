import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import { ComponentProps } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div>
        <input
          type={type}
          className={cn(
            `flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive focus-visible:ring-red-500" : "border-input"}`,
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

export function InputWithLabel({
  label,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
}) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} placeholder={props.placeholder ?? label} />
    </div>
  );
}

Input.displayName = "Input";

export { Input };
