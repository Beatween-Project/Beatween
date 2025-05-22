import { useMetronomeStore } from "@/features/metronome/model/useMetronomeStore";
import { Icon } from "@/shared/ui/Icon";

export function MetronomeToggleButton() {
  const { isEnabled, toggle } = useMetronomeStore();

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${isEnabled ? "bg-[#00C471] text-white hover:bg-[#00b060]" : "bg-neutral200 text-neutral1000 hover:bg-neutral300"}`}
    >
      <span>{isEnabled ? "메트로놈 켜기" : "메트로놈 끄기"}</span>

      <Icon icon={isEnabled ? "check" : "edit"} tone={isEnabled ? "white" : "black"} size={20} />
    </button>
  );
}
