import * as React from "react";

import { Field } from "@/components/ui/field";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface InputFieldProps extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  containerClassName?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "end",
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      !!props.value || !!props.defaultValue,
    );
    const inputId = React.useId();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const showLabel = label && (isFocused || hasValue);

    return (
      <Field className={cn("gap-2", containerClassName)}>
        <div
          className={cn(
            "relative flex items-center h-13 px-3 bg-white rounded-lg border transition-colors",
            error
              ? "border-[#C92A2A]"
              : isFocused
                ? "border-[#343A40]"
                : "border-[#ADB5BD]",
            icon && iconPosition === "end" && "gap-4",
          )}
        >
          {icon && iconPosition === "start" && (
            <div className="flex-shrink-0 mr-4 w-6 h-6 text-[#868E96]">
              {icon}
            </div>
          )}

          <div className="flex flex-col flex-1 gap-0.5 min-w-0">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-xs leading-[100%] text-[#495057] transition-opacity pointer-events-none",
                  showLabel ? "opacity-100" : "opacity-0 absolute",
                )}
              >
                {label}
              </label>
            )}
            <input
              ref={ref}
              id={inputId}
              className={cn(
                "w-full bg-transparent outline-none text-sm leading-[140%] text-[#343A40] placeholder:text-[#868E96]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className,
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              aria-invalid={!!error}
              {...props}
            />
          </div>

          {icon && iconPosition === "end" && (
            <div className="flex-shrink-0 w-6 h-6 text-[#868E96]">{icon}</div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[#C92A2A]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-xs leading-[140%]">{error}</span>
          </div>
        )}

        {helperText && !error && (
          <span className="text-xs leading-[140%] text-[#495057]">
            {helperText}
          </span>
        )}
      </Field>
    );
  },
);
InputField.displayName = "InputField";

interface PasswordInputProps extends Omit<
  InputFieldProps,
  "type" | "icon" | "iconPosition"
> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    return (
      <InputField
        ref={ref}
        type={showPassword ? "text" : "password"}
        icon={
          <button
            type="button"
            onClick={togglePassword}
            className="w-full h-full flex items-center justify-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <Icons.EyeOpen className="w-6 h-6" />
            ) : (
              <Icons.EyeClosed className="w-6 h-6" />
            )}
          </button>
        }
        iconPosition="end"
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

interface DateInputProps extends Omit<
  InputFieldProps,
  "type" | "icon" | "iconPosition"
> {}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => {
    return (
      <InputField
        ref={ref}
        type="date"
        icon={<Icons.Calendar className="w-6 h-6" />}
        iconPosition="end"
        {...props}
      />
    );
  },
);
DateInput.displayName = "DateInput";

export { DateInput, InputField, PasswordInput };
