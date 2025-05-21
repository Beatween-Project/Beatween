import { useEffect, useRef } from "react";
import { ModalProvider } from "./providers/ModalProvider";
import { AppRouter } from "./router";
import { ToastProvider } from "./providers/ToastProvider";
import { useSocketStore } from "@/app/store/socketStore";

function App() {
  const prevPathRef = useRef<string | null>(null);
  const stompClient = useSocketStore((state) => state.stompClient);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (prevPath === "/room" && currentPath !== "/room") {
      if (stompClient?.connected) {
        stompClient.deactivate();
      }
    }

    prevPathRef.current = currentPath;
  }, [location.pathname, stompClient]);

  return (
    <ToastProvider>
      <AppRouter />
      <ModalProvider />
    </ToastProvider>
  );
}

export default App;
