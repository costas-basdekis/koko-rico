import { useEffect, useLayoutEffect } from "react";

export function useWindowSize(
  fn: (windowWidth: number, windowHeight: number) => void,
  deps: React.DependencyList = [],
) {
  function updateSize() {
    fn(window.innerWidth, window.innerHeight);
  }
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, deps);
  useLayoutEffect(updateSize, deps);
}
