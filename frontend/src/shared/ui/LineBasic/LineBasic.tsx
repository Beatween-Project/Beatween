import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";

interface LineBasicProps {
  text?: string;
  editable?: boolean;
  selected?: boolean;
  mode?: "view" | "create";
  onCreate?: (value: string) => void;
  onCreateCancel?: () => void;
  onUpdate?: (value: string, onSuccess: () => void) => void;
  onDelete?: () => void;
}

export const LineBasic = ({
  text: initialText = "",
  editable,
  selected,
  mode = "view",
  onCreate,
  onCreateCancel,
  onUpdate,
  onDelete,
}: LineBasicProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [text, setText] = useState(initialText);
  const [originalText, setOriginalText] = useState(text);

  const handleEdit = () => {
    setOriginalText(text);
    setIsEditing(true);
    setIsConfirmingDelete(false);
  };

  const handleCancelEdit = () => {
    setText(originalText);
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex gap-1.5 justify-between items-center transition-all px-2 py-3 border-b border-neutral100/30 ${
        isConfirmingDelete
          ? "bg-error-gradient"
          : selected
          ? "bg-success-gradient"
          : ""
      }`}
    >
      <div className="flex-grow">
        {isEditing || mode === "create" ? (
          <Input value={text} onChange={setText} />
        ) : isConfirmingDelete ? (
          <span className="text-caution font-medium">
            곡까지 모두 지워집니다. 정말 삭제하시겠습니까?
          </span>
        ) : (
          text
        )}
      </div>

      {(editable || mode === "create") && (
        <div className="flex gap-1 min-w-fit">
          {isEditing ? (
            <>
              <Button
                icon="check"
                fill
                color="green"
                onClick={() => {
                  if (onUpdate) {
                    onUpdate(text, () => {
                      setIsEditing(false);
                      setOriginalText(text);
                    });
                  }
                }}
              >
                저장
              </Button>
              <Button icon="close" fill color="blue" onClick={handleCancelEdit}>
                취소
              </Button>
            </>
          ) : mode === "create" ? (
            <>
              <Button
                icon="add"
                fill
                color="green"
                onClick={() => {
                  if (onCreate) onCreate(text);
                  setText("");
                }}
              >
                생성
              </Button>
              <Button
                icon="close"
                fill
                color="blue"
                onClick={() => {
                  handleCancelEdit();
                  if (mode === "create" && onCreateCancel) onCreateCancel();
                }}
              >
                취소
              </Button>
            </>
          ) : isConfirmingDelete ? (
            <>
              <Button
                icon="close"
                fill
                color="blue"
                onClick={() => setIsConfirmingDelete(false)}
              >
                취소
              </Button>
              <Button
                icon="delete"
                fill
                color="caution"
                onClick={() => {
                  if (onDelete) onDelete();
                  setIsConfirmingDelete(false);
                }}
              >
                확인
              </Button>
            </>
          ) : (
            <>
              <Button icon="edit" fill color="dark" onClick={handleEdit}>
                수정
              </Button>
              <Button
                icon="delete"
                fill
                color="caution"
                onClick={() => setIsConfirmingDelete(true)}
              >
                삭제
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
