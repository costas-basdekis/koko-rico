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
    document.addEventListener("fullscreenchange", exitHandler, false);
    document.addEventListener("mozfullscreenchange", exitHandler, false);
    document.addEventListener("MSFullscreenChange", exitHandler, false);
    document.addEventListener("webkitfullscreenchange", exitHandler, false);

    function exitHandler() {
      const isFullScreen = !!document.fullscreenElement;
      if (fullscreen !== isFullScreen) {
        setFullscreen(isFullScreen);
      }
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      document.removeEventListener("fullscreenchange", exitHandler);
      document.removeEventListener("mozfullscreenchange", exitHandler);
      document.removeEventListener("MSFullscreenChange", exitHandler);
      document.removeEventListener("webkitfullscreenchange", exitHandler);
    };
  }, [$element, fullscreen, setFullscreen]);
  const toggleFullscreen = useCallback(() => {
    setFullscreen((fullscreen) => !fullscreen);
  }, [setFullscreen]);
  return [fullscreen, setFullscreen, toggleFullscreen];
}
