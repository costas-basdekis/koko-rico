import { useCallback, useEffect, useMemo, useState } from "react";

export function useStayAwake(
  desiredStayAwake?: boolean,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [stayAwake, setStayAwake] = useState(false);
  if (desiredStayAwake !== undefined && desiredStayAwake !== stayAwake) {
    setStayAwake(desiredStayAwake);
  }
  const wakeLockContext: { wakelock: WakeLockSentinel | null } = useMemo(() => {
    return {
      wakelock: null,
    };
  }, []);
  const requestWakeLock = useCallback(async () => {
    if (wakeLockContext.wakelock && !wakeLockContext.wakelock.released) {
      setStayAwake(true);
      return;
    }
    let wakeLock;
    try {
      if (!navigator?.wakeLock?.request) {
        console.warn("Wakelock API not available");
        return;
      }
      wakeLock = await navigator.wakeLock.request();
    } catch (err) {
      console.error(err);
      wakeLockContext.wakelock = null;
      setStayAwake(false);
      return;
    }
    wakeLock.addEventListener("release", () => {
      wakeLockContext.wakelock = null;
      setStayAwake(false);
    });
    wakeLockContext.wakelock = wakeLock;
    setStayAwake(true);
  }, [wakeLockContext, setStayAwake]);
  useEffect(() => {
    const hasWakeLock = wakeLockContext.wakelock !== null;
    if (stayAwake !== hasWakeLock) {
      requestWakeLock();
    }
    return () => {
      if (wakeLockContext.wakelock) {
        wakeLockContext.wakelock.release();
      }
    };
  }, [stayAwake, requestWakeLock, wakeLockContext]);
  return [stayAwake, setStayAwake];
}
