import { Icon } from "@/shared/ui/Icon";
import { useModalStore } from "@/shared/lib/store/modalStore";
import BpmRatioSelector from "@/features/player/ui/BpmRatioSelector";
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function BpmControlButton() {
  const { openModal, closeModal } = useModalStore();
  const bpm = useScoreStore((state) => state.bpm); // 현재 BPM 가져오기

  const handleClick = () => {
    openModal("action", {
      title: "",
      info: "",
      okText: null,
      cancelText: null,
      children: <BpmRatioSelector onClose={closeModal} />,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded bg-neutral800 hover:bg-neutral700 text-sm"
    >
      <Icon icon="settings" size={18} />
      <span>{bpm} bpm</span>
    </button>
  );
}
