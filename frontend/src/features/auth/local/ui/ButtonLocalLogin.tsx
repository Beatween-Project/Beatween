import { Button } from "@/shared/ui/Button";
import { ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";

interface ButtonLocalLoginProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {}

export const ButtonLocalLogin = ({
  className,
  ...props
}: ButtonLocalLoginProps) => {
  const navigate = useNavigate();

  return (
    <Button
      icon="email"
      fill
      color="green"
      className={`w-[18rem] max-w-full ${className}`}
      onClick={() => {
        navigate("/signin");
      }}
      {...props}
    >
      이메일로 시작하기
    </Button>
  );
};
