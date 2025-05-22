// shared/ui/Modal/ModalRoot.tsx
import { useModalStore } from "@/shared/lib/store/modalStore";
import { ModalPortal } from "./ModalPortal";
import { ModalAlert } from "@/shared/ui/Modal/ModalAlert";
import { ModalConfirm } from "@/shared/ui/Modal/ModalConfirm";
import { ModalAction } from "./ModalAction";

export function ModalRoot() {
  const { type, props, closeModal } = useModalStore();

  if (!type) return null;

  const renderModal = () => {
    switch (type) {
      case "alert":
        return <ModalAlert {...props} onClose={closeModal} />;
      case "confirm":
        return <ModalConfirm {...props} onClose={closeModal} />;
      default:
        return <ModalAction {...props} onClose={closeModal} />;
    }
  };

  return <ModalPortal>{renderModal()}</ModalPortal>;
}
