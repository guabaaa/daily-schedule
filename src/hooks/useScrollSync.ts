/**
 * 스크롤 동기화 커스텀 훅
 */

import { useEffect, useRef, RefObject } from "react";

export function useScrollSync(targetRef: RefObject<HTMLDivElement | null>) {
  const sourceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sourceElement = sourceRef.current;
    const targetElement = targetRef.current;

    if (!sourceElement || !targetElement) return;

    const handleScroll = () => {
      targetElement.scrollTop = sourceElement.scrollTop;
    };

    sourceElement.addEventListener("scroll", handleScroll);

    return () => {
      sourceElement.removeEventListener("scroll", handleScroll);
    };
  }, [targetRef]);

  return sourceRef;
}
