import { useEffect, useState } from 'react';

export const useCountUp = (target: number, duration: number = 1200, enabled: boolean = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    let startTimestamp: number | null = null;
    const isFloat = !Number.isInteger(target);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease-out quad easing curve: t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const val = easeProgress * target;
      
      setCount(isFloat ? Math.round(val * 10) / 10 : Math.floor(val));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [target, duration, enabled]);

  return count;
};
export default useCountUp;
