import "./ControlButton.css";
import { useMemo } from "react";

export function ControlButton({
  children,
  ...props
}: JSX.IntrinsicElements["button"]) {
  const className = useMemo(() => {
    return `control-button ${props.className}`;
  }, [props.className]);
  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
}

export function ButtonRow({
  children,
  ...props
}: JSX.IntrinsicElements["div"]) {
  const className = useMemo(() => {
    return `button-row ${props.className}`;
  }, [props.className]);
  return (
    <div {...props} className={className}>
      {children}
    </div>
  );
}

export function ButtonLike({
  children,
  ...props
}: JSX.IntrinsicElements["label"]) {
  const className = useMemo(() => {
    return `button-like ${props.className}`;
  }, [props.className]);
  return (
    <label {...props} className={className}>
      {children}
    </label>
  );
}

export interface ButtonHotkeyProps {
  robotIndex?: number;
  children?: any;
}

export function ButtonHotkey({ robotIndex, children }: ButtonHotkeyProps) {
  return (
    <span
      className={`button-hotkey ${robotIndex !== undefined ? `index-${robotIndex}` : ""}`}
    >
      {children}
    </span>
  );
}
