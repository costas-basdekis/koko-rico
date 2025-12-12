import { useCallback, useEffect, useMemo, useState } from "react";

export function useFullscreen(
  elementOrQuerySelector: string | Element = "html",
): [boolean, React.Dispatch<React.SetStateAction<boolean>>, () => void] {
  const $element = useMemo(() => {
    if (typeof elementOrQuerySelector === "string") {
      let $element = document.querySelector(elementOrQuerySelector);
      if (!$element) {
        console.error(
          `Could not find specified element via query selector "${elementOrQuerySelector}", using body`,
        );
        return document.body;
      }
      return $element;
    }
    return elementOrQuerySelector;
  }, [elementOrQuerySelector]);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    if (fullscreen !== !!document.fullscreenElement) {
      if (fullscreen) {
        $element.requestFullscreen().then(undefined, () => {
          setFullscreen(false);
        });
      } else {
        document.exitFullscreen();
      }
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [$element, fullscreen, setFullscreen]);
  const toggleFullscreen = useCallback(() => {
    setFullscreen((fullscreen) => !fullscreen);
  }, [setFullscreen]);
  return [fullscreen, setFullscreen, toggleFullscreen];
}
