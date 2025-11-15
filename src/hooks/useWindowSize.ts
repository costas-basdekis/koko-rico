import { useLayoutEffect } from "react";

export function useWindowSize(fn: (windowWidth: number, windowHeight: number) => void, deps: React.DependencyList = []) {
  useLayoutEffect(() => {
    function updateSize() {
      fn(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, deps);
}
