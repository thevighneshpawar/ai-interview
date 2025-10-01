import { useEffect, useRef, useState } from "react";

export default function useTimer(
  initialSeconds: number,
  onExpire?: () => void
) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!running) {
      setRunning(true);
    }
  };

  const pause = () => {
    setRunning(false);
  };

  const reset = (seconds = initialSeconds) => {
    setRunning(false);
    setTimeLeft(seconds);
  };

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setRunning(false);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [running]);

  return { timeLeft, start, pause, reset, running };
}
