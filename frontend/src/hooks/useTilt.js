import { useState, useCallback, useRef, useEffect } from 'react';

export function useTilt(config = {}) {
  const { max = 15, perspective = 1000, scale = 1.05, reverse = false, disabled = false } = config;
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: `perspective(${perspective}px)` });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (disabled || isTouch || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5; // -0.5 to 0.5
    const yPct = (mouseY / height) - 0.5;

    const factor = reverse ? -1 : 1;
    const rotateX = max * yPct * -1 * factor;
    const rotateY = max * xPct * factor;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: 'transform 0.1s ease-out'
    });
  }, [max, perspective, scale, reverse, disabled, isTouch]);

  const onMouseLeave = useCallback(() => {
    if (disabled || isTouch) return;
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: 'transform 0.5s ease-out'
    });
  }, [disabled, perspective, isTouch]);

  return { ref, style, onMouseMove, onMouseLeave };
}
