// /shared/lib/highlightUtils.ts
export type MeasureGroup = {
  number: number;
  elements: SVGGElement[];
};

export function highlightMeasureNumber(groups: MeasureGroup[], number: number) {
  console.log("📌 highlightMeasureNumber 호출됨");
  console.log("👉 하이라이트할 마디 번호:", number);
  console.log("🔢 전체 마디 그룹 수:", groups.length);

  // 기존 하이라이트 제거
  const existingHighlights = document.querySelectorAll(".highlight-bg");
  console.log("🧹 기존 하이라이트 제거 대상 수:", existingHighlights.length);
  existingHighlights.forEach((el) => el.remove());

  const group = groups.find((g) => g.number === number);
  if (!group) {
    console.warn("⚠️ 해당 마디 번호를 가진 그룹을 찾지 못함:", number);
    return;
  }

  console.log("✅ 하이라이트할 마디 그룹 찾음:", group.number);
  console.log("📦 마디 내 요소 수:", group.elements.length);

  group.elements.forEach((el, idx) => {
    requestAnimationFrame(() => {
      const bbox = el.getBBox();
      console.log(
        `🖼 [${idx}] BBox - x:${bbox.x}, y:${bbox.y}, w:${bbox.width}, h:${bbox.height}`
      );

      const highlightRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );

      highlightRect.setAttribute("x", `${bbox.x - 2}`);
      highlightRect.setAttribute("y", `${bbox.y - 2}`);
      highlightRect.setAttribute("width", `${bbox.width + 4}`);
      highlightRect.setAttribute("height", `${bbox.height + 4}`);
      highlightRect.setAttribute("fill", "#ffeaa7");
      highlightRect.setAttribute("opacity", "0.5");
      highlightRect.setAttribute("rx", "6");
      highlightRect.setAttribute("class", "highlight-bg");

      el.insertBefore(highlightRect, el.firstChild);
      console.log(`✅ 하이라이트 박스 추가 완료 [${idx}]`);
    });
  });
  console.log("🎉 highlightMeasureNumber 완료");
}
