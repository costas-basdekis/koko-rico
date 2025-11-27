import { useMemo } from "react";

export class TapHandler {
  onClick: () => void;
  threshold: number;
  identifier: number | null = null;
  active: boolean = false;
  startX: number = 0;
  startY: number = 0;

  static use(onClick: () => void, threshold?: number) {
    return useMemo(
      () => new TapHandler(onClick, threshold),
      [onClick, threshold],
    );
  }

  constructor(onClick: () => void, threshold: number = 2) {
    this.onClick = onClick;
    this.threshold = threshold;
  }

  get touchProps() {
    return {
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
    };
  }

  onTouchStart = (e: React.TouchEvent<SVGRectElement>) => {
    if (this.identifier !== null) {
      return;
    }
    const touch = e.changedTouches[0];
    this.identifier = touch.identifier;
    this.active = true;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  };

  onTouchMove = (e: React.TouchEvent<SVGRectElement>) => {
    if (!this.active) {
      return;
    }
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.identifier,
    );
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const moveThreshold = 10; // pixels
    if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > moveThreshold) {
      // Consider this a move, cancel the touch
      this.active = false;
    }
  };

  onTouchEnd = (e: React.TouchEvent<SVGRectElement>) => {
    if (this.identifier === null) {
      return;
    }
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.identifier,
    );
    if (!touch) {
      return;
    }
    if (this.active) {
      // Consider this a tap
      this.onClick();
    }
    this.identifier = null;
    this.active = false;
  };

  onTouchCancel = (e: React.TouchEvent<SVGRectElement>) => {
    if (this.identifier === null) {
      return;
    }
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.identifier,
    );
    if (!touch) {
      return;
    }
    this.identifier = null;
    this.active = false;
  };
}
