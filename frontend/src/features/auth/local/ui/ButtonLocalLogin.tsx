import { Button } from "@/shared/ui/Button";
import { ButtonHTMLAttributes } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ButtonLocalLoginProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {}

export const ButtonLocalLogin = ({
  className,
  ...props
}: ButtonLocalLoginProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const slug = searchParams.get("slug");
  const shareKey = searchParams.get("shareKey");

  const handleClick = () => {
    let url = "/signin";
    if (slug && shareKey) {
      url += `?slug=${slug}&shareKey=${shareKey}`;
    }
    navigate(url);
  };

  return (
    <Button
      icon="email"
      fill
      color="green"
      className={`w-[18rem] max-w-full ${className}`}
      onClick={handleClick}
      {...props}
    >
      이메일로 시작하기
    </Button>
  );
};
