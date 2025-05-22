import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 클래스명을 조건부로 결합하는 유틸리티 함수
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// MusicXML 관련 유틸리티 함수
export function parseMusicXML(xmlString: string) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, "text/xml")

  // 기본 정보 추출
  const title = xmlDoc.querySelector("work-title")?.textContent || "제목 없음"
  const composer = xmlDoc.querySelector('creator[type="composer"]')?.textContent || "작곡가 미상"

  // 마디 수 계산
  const measures = xmlDoc.querySelectorAll("measure").length

  return {
    title,
    composer,
    measures,
    xmlDoc,
  }
}

// 템포 변환 유틸리티
export function bpmToMilliseconds(bpm: number) {
  // 한 비트당 밀리초
  return (60 / bpm) * 1000
}
