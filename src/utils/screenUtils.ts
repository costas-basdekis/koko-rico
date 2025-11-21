export function isTouchDevice(): boolean {
  return  (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    // @ts-ignore
    ("msMaxTouchPoints" in navigator && navigator.msMaxTouchPoint > 0)
  );
}
