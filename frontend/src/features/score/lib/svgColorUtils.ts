const originalColorsRef = new Map<Element, { fill: string; stroke: string }>();

export const applyGrayColor = (element: Element) => {
  const svgElements = element.querySelectorAll('*');
  svgElements.forEach((el) => {
    if (el instanceof SVGElement) {
      // 원본 색상 저장
      if (!originalColorsRef.has(el)) {
        const computedStyle = window.getComputedStyle(el);
        originalColorsRef.set(el, {
          fill: el.getAttribute('fill') || computedStyle.fill || '',
          stroke: el.getAttribute('stroke') || computedStyle.stroke || '',
        });
      }

      // 회색 강제 설정
      el.style.setProperty('fill', '#202020', 'important');
      el.style.setProperty('stroke', '#202020', 'important');
    }
  });
};

export const restoreOriginalColor = (element: Element) => {
  const svgElements = element.querySelectorAll('*');
  svgElements.forEach((el) => {
    if (el instanceof SVGElement && originalColorsRef.has(el)) {
      const original = originalColorsRef.get(el)!;
      el.style.setProperty('fill', original.fill || '', 'important');
      el.style.setProperty('stroke', original.stroke || '', 'important');
    }
  });
};
