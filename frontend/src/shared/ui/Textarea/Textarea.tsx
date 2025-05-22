import { ChangeEvent } from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  rows?: number;
}

export const TextArea = ({
  value,
  onChange,
  placeholder = "",
  maxLength,
  showCount = false,
  className = "",
  rows = 4,
}: TextAreaProps) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength !== undefined && newValue.length > maxLength) return;
    onChange(newValue);
  };

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`w-full resize-none bg-neutral300 text-neutral1000 placeholder:text-neutral600 border border-gray-300 rounded-xl px-4 py-2 ${
          showCount ? "pr-14" : ""
        } focus:outline-none focus:ring-2 focus:ring-brandcolor200 ${className}`}
      />
      {showCount && maxLength !== undefined && (
        <div className="absolute bottom-2 right-3 text-sm text-neutral700 pointer-events-none">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
