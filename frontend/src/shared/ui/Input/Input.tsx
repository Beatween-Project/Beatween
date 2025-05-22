import { ChangeEvent, FocusEventHandler, InputHTMLAttributes } from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

export const Input = ({
  value,
  onChange,
  type = "text",
  placeholder = "",
  maxLength,
  showCount = false,
  className = "",
  onBlur,
}: InputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (maxLength !== undefined && newValue.length > maxLength) return;
    onChange(newValue);
  };

  return (
    <div className="border-box relative z-50 w-full">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`border-box w-full bg-neutral300 text-neutral1000 placeholder:text-neutral600 border border-gray-300 rounded-xl px-4 py-2 ${
          showCount ? "pr-14" : ""
        } focus:outline-none focus:ring-2 focus:ring-brandcolor200 ${className}`}
      />
      {showCount && maxLength !== undefined && (
        <div className="absolute top-[50%] -translate-y-[50%] right-3 text-sm text-neutral700 pointer-events-none">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
