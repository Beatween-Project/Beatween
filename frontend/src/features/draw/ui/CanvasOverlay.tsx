import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import ColorPicker from "@/features/draw/ui/ColorPicker";

interface CanvasOverlayProps {
  sheetId: number;
  spaceId: string;
  userId: string;
  selectedColor: string;
  isPaletteVisible: boolean;
  onColorChange: (color: string) => void;
  isSocketConnected: boolean;
  stompClient: Client | null;
}

export default function CanvasOverlay({
  sheetId,
  spaceId,
  // userId, //ts 오류 때문에 잠시 주석처리해둡니다, 충돌이나 오류나면 주석 풀어주세요
  selectedColor,
  isPaletteVisible,
  onColorChange,
  isSocketConnected,
  stompClient,
}: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [showPalette, setShowPalette] = useState(isPaletteVisible);
  const clientIdRef = useRef<string>(crypto.randomUUID());

  // show-color-picker 이벤트 수신
  useEffect(() => {
    const handler = () => {
      console.log("🎨 색상 선택기 열림 → 드로잉 활성화 true");
      setShowPalette(true);
    };
    window.addEventListener("show-color-picker", handler);
    return () => window.removeEventListener("show-color-picker", handler);
  }, []);

  const getRelativeCoords = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const drawDot = (x: number, y: number, color = "black") => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const canvas = canvasRef.current!;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * canvas.width, y * canvas.height, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!drawing || !showPalette) return;
    const { x, y } = getRelativeCoords(e);
    drawDot(x, y, selectedColor);

    stompClient?.publish({
      destination: "/app/updateDraw",
      body: JSON.stringify({
        spaceId,
        copySheetId: sheetId,
        relativeX: x,
        relativeY: y,
        color: selectedColor,
        sender: clientIdRef.current,
        erase: false,
      }),
    });
  };

  useEffect(() => {
    if (!stompClient || !isSocketConnected) return;

    const subscription = stompClient.subscribe(
      `/topic/draw/${sheetId}`,
      (msg) => {
        const data = JSON.parse(msg.body);
        if (data.sender === clientIdRef.current) return;
        drawDot(data.relativeX, data.relativeY, data.color || "red");
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, isSocketConnected, sheetId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = () => {
      if (showPalette) setDrawing(true);
    };
    const onMouseUp = () => setDrawing(false);

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [drawing, selectedColor, showPalette]);

  useEffect(() => {
    console.log(
      "🖼️ CanvasOverlay mounted, isPaletteVisible:",
      isPaletteVisible
    );
  }, [isPaletteVisible]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {showPalette && (
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20 }}>
          <ColorPicker onChange={onColorChange} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={1000}
        height={1200}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          pointerEvents: showPalette ? "auto" : "none",
        }}
      />
    </div>
  );
}
