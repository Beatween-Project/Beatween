import { bgColorClassMap } from "@/shared/lib/bgColorClassMap";
import { Icon } from "@/shared/ui/Icon";
import { useNavigate } from "react-router-dom";

export const ErrorPage = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div
      className={`${bgColorClassMap["blue"]} w-full h-full flex items-center justify-center`}
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-12">
          <div className="text-[4.75vw] font-cafe24 text-transparent text-stroke-1000">
            NOT FOUND
          </div>
          <div>페이지가 사라졌거나 주소를 잘못 입력했을 수 있습니다.</div>
        </div>
        <div>
          <div className="text-[16.5vw] text-transparent text-stroke-100">
            404
          </div>
          <div onClick={goToHome} className="cursor-pointer">
            <Icon icon="north_east" />
            <span className="font-cafe24">GO HOME</span>
          </div>
        </div>
      </div>
    </div>
  );
};
