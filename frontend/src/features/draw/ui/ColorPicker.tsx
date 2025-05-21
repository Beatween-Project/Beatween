import React from "react";

interface ColorPickerProps {
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/90 p-2 rounded-md shadow-md">
      <span className="text-sm font-medium text-gray-700">색상</span>
      <input
        type="color"
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border-none p-0 cursor-pointer"
      />
    </div>
  );
};

export default ColorPicker;
