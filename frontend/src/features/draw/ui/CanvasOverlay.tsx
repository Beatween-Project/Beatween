import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import ColorPicker from "./ColorPicker";

interface CanvasOverlayProps {
  userId: string;
  sheetId: number;
  spaceId: string;
  selectedColor: string;
  isPaletteVisible: boolean;
  onColorChange: (color: string) => void;
  isSocketConnected: boolean;
  stompClient: Client | null;
  
}

type Point = { x: number; y: number };

export default function CanvasOverlay({
  sheetId,
  spaceId,
  selectedColor,
  isPaletteVisible,
  onColorChange,
  isSocketConnected,
  stompClient,
}: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const clientIdRef = useRef<string>(crypto.randomUUID());
  const pointsRef = useRef<Point[]>([]);

  const getRelativeCoords = (e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const isTouch = (e as TouchEvent).touches !== undefined;
    const clientX = isTouch
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;
    const clientY = isTouch
      ? (e as TouchEvent).touches[0].clientY
      : (e as MouseEvent).clientY;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x, y };
  };

  const drawLine = (points: Point[], color: string) => {
    const ctx = canvasRef.current?.getContext("2d");
    const canvas = canvasRef.current;
    if (!ctx || !canvas || points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * canvas.width, points[i].y * canvas.height);
    }
    ctx.stroke();
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!drawing || !canvasRef.current) return;
    e.preventDefault();

    const point = getRelativeCoords(e);
    pointsRef.current.push(point);
    drawLine(pointsRef.current.slice(-2), selectedColor);

    stompClient?.publish({
      destination: "/app/updateDraw",
      body: JSON.stringify({
        spaceId,
        copySheetId: sheetId,
        relativeX: point.x,
        relativeY: point.y,
        color: selectedColor,
        sender: clientIdRef.current,
        erase: false,
      }),
    });
  };

  useEffect(() => {
    if (!stompClient || !isSocketConnected) return;

    const subscription = stompClient.subscribe(`/topic/draw/${sheetId}`, (msg) => {
      const data = JSON.parse(msg.body);
      if (data.sender === clientIdRef.current) return;
      drawLine([{ x: data.relativeX, y: data.relativeY }], data.color || "red");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, isSocketConnected, sheetId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const start = (e: Event) => {
      e.preventDefault();
      setDrawing(true);
      pointsRef.current = [];
    };
    const end = (e: Event) => {
      e.preventDefault();
      setDrawing(false);
      pointsRef.current = [];
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchend", end, { passive: false });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchend", end);
      canvas.removeEventListener("touchmove", handlePointerMove);
    };
  }, [drawing, selectedColor]);

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
      {isPaletteVisible && (
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20 }}>
          <ColorPicker color={selectedColor} onChange={onColorChange} />
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
          pointerEvents: isPaletteVisible ? "auto" : "none",
        }}
      />
    </div>
  );
}
