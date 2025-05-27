export type ParsedPart =
  | { type: "highlight"; text: string }
  | { type: "text"; text: string };

export function parseMessageToParts(message: string): ParsedPart[] {
  const parts: ParsedPart[] = [];

  // 하이라이팅 내용에 대괄호가 있을 경우를 고려하여,
  // 모든 알림에 ']님이 ['가 포함되는 특성을 참고하여
  // ']님이 [' 문자열을 기준으로 나누도록 했습니다.
  // back에서 처리할 수도 있지만, db 문제로 인하여
  // 빠른 처리를 위해 임의 함수로 작성해 처리하게 되었습니다
  // 차후 리팩토링 대상 중 하나입니다
  const pivotText = "]님이 [";
  const pivotIdx = message.indexOf(pivotText);

  // ']님이 [' 가 없는 경우
  if (pivotIdx === -1) {
    parts.push({ type: "text", text: message });
    return parts;
  }

  const left = message.slice(0, pivotIdx + 1);
  const mid = pivotText.slice(1, pivotText.length - 1);
  const right = message.slice(pivotIdx + pivotText.length - 1);

  const leftOpenIdx = left.indexOf("[");
  const leftCloseIdx = left.lastIndexOf("]");
  if (leftOpenIdx !== -1 && leftCloseIdx !== -1 && leftOpenIdx < leftCloseIdx) {
    // 왼쪽 텍스트: '[' 이전 텍스트
    if (leftOpenIdx > 0) {
      parts.push({ type: "text", text: left.slice(0, leftOpenIdx) });
    }
    // 왼쪽 하이라이트
    parts.push({
      type: "highlight",
      text: left.slice(leftOpenIdx + 1, leftCloseIdx),
    });
    // 왼쪽 ']' 이후 텍스트 (pivot까지 포함)
    if (leftCloseIdx + 1 < left.length) {
      parts.push({ type: "text", text: left.slice(leftCloseIdx + 1) });
    }
  } else {
    parts.push({ type: "text", text: left });
  }

  // '님이 '
  parts.push({ type: "text", text: mid });

  const rightOpenIdx = right.indexOf("[");
  const rightCloseIdx = right.lastIndexOf("]");

  if (
    rightOpenIdx !== -1 &&
    rightCloseIdx !== -1 &&
    rightOpenIdx < rightCloseIdx
  ) {
    if (rightOpenIdx > 0) {
      parts.push({ type: "text", text: right.slice(0, rightOpenIdx) });
    }
    parts.push({
      type: "highlight",
      text: right.slice(rightOpenIdx + 1, rightCloseIdx),
    });
    if (rightCloseIdx + 1 < right.length) {
      parts.push({ type: "text", text: right.slice(rightCloseIdx + 1) });
    }
  } else {
    parts.push({ type: "text", text: right });
  }

  return parts;
}

export function renderParsedParts(parts: ParsedPart[]) {
  return parts.map((part, index) =>
    part.type === "highlight" ? (
      <span key={index} className="text-brandcolor100 font-medium">
        {part.text}
      </span>
    ) : (
      <span key={index}>{part.text}</span>
    )
  );
}
