import { Button } from "../Button";
import { Icon } from "../Icon";
import { PanelModal } from "../Panel";

interface ModalSimpleFrameProps {
  type: "alert" | "confirm";
  title?: string;
  info?: string;
  cancelText?: string;
  onCancel?: () => void;
  okText?: string;
  onConfirm?: () => void;
}

export const ModalSimpleFrame = ({
  type = "alert",
  title,
  info,
  cancelText,
  onCancel,
  okText,
  onConfirm,
}: ModalSimpleFrameProps) => {
  return (
    <PanelModal
      tone="light"
      className="w-[24rem] flex flex-col items-center gap-5 py-10 px-6"
    >
      <div
        className={`${
          type === "alert" ? "text-brandcolor200" : "text-warning"
        } flex`}
      >
        {type === "alert" ? (
          <Icon icon="info" fill />
        ) : (
          <Icon icon="warning" fill />
        )}
      </div>
      <div className="flex flex-col gap-4 items-center text-center">
        <p className="text-2xl font-bold">{title}</p>
        <p className="text-base whitespace-pre-line">{info}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {type === "confirm" && (
          <Button size="medium" color="dark" onClick={onCancel}>
            {cancelText ? cancelText : "취소"}
          </Button>
        )}
        <Button
          size="medium"
          color={type === "alert" ? "green" : "caution"}
          onClick={onConfirm}
        >
          {okText ? okText : "확인"}
        </Button>
      </div>
    </PanelModal>
  );
};
