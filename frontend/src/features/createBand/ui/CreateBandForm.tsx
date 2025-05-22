import { BandForm, BandFormHandle } from "@/entities/band/ui/BandForm";
import { forwardRef } from "react";

export const CreateBandForm = forwardRef<BandFormHandle>((_, ref) => {
  return <BandForm ref={ref} />;
});
