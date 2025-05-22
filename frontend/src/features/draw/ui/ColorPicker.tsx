import { ChromePicker } from "react-color";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  isVisible?: boolean;
}

export default function ColorPicker({
  color,
  onChange,
  isVisible = true,
}: ColorPickerProps) {
  if (!isVisible) return null;

  return (
    <div className="rounded shadow-md border bg-white p-2">
      <ChromePicker
        color={color}
        onChange={(updatedColor) => onChange(updatedColor.hex)}
        disableAlpha
      />
    </div>
  );
}
