import { useState } from "react";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { isValidBpm } from "@/features/player/lib/bpmUtils";
import { Icon } from "@/shared/ui/Icon";

interface BpmRatioSelectorProps {
  onClose: () => void;
}

const BpmRatioSelector = ({ onClose }: BpmRatioSelectorProps) => {
  const bpm = useScoreStore((state) => state.bpm);
  const baseBpm = useScoreStore((state) => state.baseBpm);
  const setBpm = useScoreStore((state) => state.setBpm);

  const [selectedRatio, setSelectedRatio] = useState<number>(bpm / baseBpm);
  const [tempBpm, setTempBpm] = useState<number>(bpm);
  const [isEditing, setIsEditing] = useState(false);

  const handleRatioSelect = (r: number) => {
    const newBpm = Math.round(baseBpm * r);
    setSelectedRatio(r);
    setTempBpm(newBpm);
    setIsEditing(false);
  };

  const handleApply = () => {
    if (isValidBpm(tempBpm)) {
      setBpm(tempBpm);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setTempBpm(value);
    }
  };

  return (
    <div className="w-full text-white text-center flex flex-col items-center gap-3">
      {/* 상단 BPM 표시 */}
      <div className="flex justify-center items-center gap-2 text-xl font-bold">
        <button onClick={() => setIsEditing(true)}>
          <Icon icon="edit" tone="white" size={18} />
        </button>
        {isEditing ? (
          <input
            type="number"
            value={tempBpm}
            onChange={handleInputChange}
            onBlur={() => setIsEditing(false)}
            className="w-20 text-center bg-neutral-700 text-white px-2 py-1 rounded text-sm border border-white/20"
          />
        ) : (
          <span>{tempBpm} bpm</span>
        )}
      </div>

      {/* 원곡 템포 */}
      <p className="text-xs text-neutral-400">원곡 템포: {baseBpm}bpm</p>

      {/* 배속 버튼 */}
      <div className="w-full flex flex-col divide-y divide-white/20 border-t border-white/20">
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <button
            key={r}
            className={`w-full text-left px-4 py-3 text-sm transition font-medium ${
              selectedRatio === r
                ? "bg-[#42BA84]/50 text-white"
                : "bg-transparent text-white"
            }`}
            onClick={() => handleRatioSelect(r)}
          >
            {r === 1 ? "기본" : r}
          </button>
        ))}
      </div>

      {/* 적용하기 버튼 */}
      <button
        onClick={handleApply}
        className="w-full bg-[#6675F7] hover:bg-[#5a66db] text-white py-2 rounded text-sm font-semibold"
      >
        적용하기
      </button>
    </div>
  );
};

export default BpmRatioSelector;
