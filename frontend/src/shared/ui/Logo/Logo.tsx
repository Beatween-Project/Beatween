import { useNavigate } from "react-router-dom";

interface LogoProps {
  onClick?: () => void;
}

export const Logo = ({ onClick }: LogoProps) => {
  const navigate = useNavigate();

  const handleClick = () => (onClick ? onClick() : navigate("/"));

  return (
    <button
      onClick={handleClick}
      className="text-brandcolor200 text-3xl font-cafe24"
    >
      BEATWEEN
    </button>
  );
};
