import { ButtonHTMLAttributes } from "react";
import { SpaceButtonPanel } from "./SpaceButtonPanel";

interface PlaywithButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  number?: number;
}

export const PlaywithButton = ({
  number = 0,
  ...props
}: PlaywithButtonProps) => {
  const IsMemberExist = number > 0;

  return (
    <SpaceButtonPanel className="group" {...props}>
      <div className="h-full flex flew-wrap gap-3 flex-grow">
        <div
          className={`w-3 h-full rounded-xl ${
            IsMemberExist ? "bg-brandcolor200" : "bg-brandcolor100"
          }`}
        />
        <div className="flex flex-grow flex-wrap gap-1 justify-between items-center">
          <div className="flex flex-col flex-grow text-left">
            <div className="text-xl font-bold text-brandcolor200/70">
              합주 방
            </div>
            <div
              className={
                IsMemberExist ? "text-brandcolor200/70" : "text-neutral600"
              }
            >
              현재 {number}명 참여중
            </div>
          </div>
          <div className="text-xl font-bold flex-grow text-brandcolor200 text-right">
            참여하러 가기
          </div>
        </div>
      </div>
    </SpaceButtonPanel>
  );
};
