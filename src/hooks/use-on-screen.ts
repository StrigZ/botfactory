import { type RefObject, useEffect, useRef, useState } from 'react';

export default function useOnScreen({
  ref,
  onIntersecting,
  threshold = 0.5,
}: {
  ref: RefObject<HTMLElement | null>;
  onIntersecting?: () => void;
  threshold?: number;
}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasCallbackFired = useRef<boolean>(false);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isIntersecting = entry.isIntersecting;
        setIsOnScreen(isIntersecting);

        if (isIntersecting && onIntersecting && !hasCallbackFired.current) {
          onIntersecting();
          hasCallbackFired.current = true;
        } else if (!isIntersecting) {
          hasCallbackFired.current = false;
        }
      },
      { threshold },
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (!observerRef.current) {
        return;
      }

      observerRef.current.disconnect();
    };
  }, [onIntersecting, ref, threshold]);

  return isOnScreen;
}
