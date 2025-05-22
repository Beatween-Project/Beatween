import { SpaceNav } from "./ui/SpaceNav";
import { Outlet } from "react-router-dom";

export const SpaceLayout = () => {
  return (
    <div className="flex w-full h-full px-4 py-5 gap-4">
      <SpaceNav />
      <section className="bg-neutral100/10 shadow-custom w-full h-full rounded-xl overflow-y-auto scroll-custom">
        <Outlet />
      </section>
    </div>
  );
};
