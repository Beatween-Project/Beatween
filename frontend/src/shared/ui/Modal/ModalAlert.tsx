import { useModalStore } from "@/shared/lib/store/modalStore";
import { ModalBackground } from "./ModalBackground";
import { ModalSimpleFrame } from "./ModalSimpleFrame";

export const ModalAlert = () => {
  const { props, closeModal } = useModalStore();
  const { title, info, okText, onConfirm } = props;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <ModalBackground>
      <ModalSimpleFrame
        type="alert"
        title={title}
        info={info}
        okText={okText}
        onConfirm={handleConfirm}
      />
    </ModalBackground>
  );
};
