import { useModalStore } from "@/shared/lib/store/modalStore";
import { ReactNode } from "react";

interface DefaultModalProps {
  title?: string;
  info?: string;
  okText?: string;
  onConfirm?: () => void;
}

interface AlertModalProps extends DefaultModalProps {}

interface ConfirmModalProps extends DefaultModalProps {
  cancelText?: string;
  onCancel?: () => void;
}

interface ActionModalProps extends DefaultModalProps {
  children: ReactNode;
  buttonType?: "default" | "icon";
  icon?: string;
  fill?: boolean;
}
export const closeModal = () => {
  useModalStore.getState().closeModal();
};

export const openAlert = (props: AlertModalProps) => {
  useModalStore.getState().openModal("alert", props);
};

export const openConfirm = (props: ConfirmModalProps) => {
  useModalStore.getState().openModal("confirm", props);
};

export const openModal = (props: ActionModalProps) => {
  useModalStore.getState().openModal("action", props);
};
