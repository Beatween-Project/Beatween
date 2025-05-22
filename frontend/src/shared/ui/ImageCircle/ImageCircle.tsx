import { useState } from "react";
import { Icon } from "../Icon";

interface ImageCircleProps {
  imageUrl?: string;
  alt?: string;
  onClick?: () => void;
}

export const ImageCircle = ({ imageUrl, alt, onClick }: ImageCircleProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`w-10 h-10 font-cafe24 rounded-full overflow-hidden ${
        imageError ? "bg-error text-error" : "bg-neutral400"
      } text-neutral1000 flex justify-center items-center`}
      onClick={onClick}
    >
      {!imageUrl ? (
        <>
          <Icon icon="person" fill />
        </>
      ) : imageError ? (
        <>
          <Icon icon="broken_image" fill tone="white" />
        </>
      ) : (
        <>
          <img
            src={imageUrl}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        </>
      )}
    </div>
  );
};
