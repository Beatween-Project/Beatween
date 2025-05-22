import { useModalStore } from "@/shared/lib/store/modalStore";
import { ModalBackground } from "./ModalBackground";
import { ModalSimpleFrame } from "./ModalSimpleFrame";

export const ModalConfirm = () => {
  const { props, closeModal } = useModalStore();
  const { title, info, cancelText, onCancel, okText, onConfirm } = props;

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <ModalBackground>
      <ModalSimpleFrame
        type="confirm"
        title={title}
        info={info}
        cancelText={cancelText}
        onCancel={handleCancel}
        okText={okText}
        onConfirm={handleConfirm}
      />
    </ModalBackground>
  );
};
