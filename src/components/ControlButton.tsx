import "./ControlButton.css";
import { useMemo } from "react";

export function ControlButton({
  children,
  ...props
}: React.HTMLProps<HTMLButtonElement>) {
  const className = useMemo(() => {
    return `control-button ${props.className}`;
  }, [props.className]);
  return <button className={className}>{children}</button>;
}

export function ButtonRow({
  children,
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  const className = useMemo(() => {
    return `button-row ${props.className}`;
  }, [props.className]);
  return <div className={className}>{children}</div>;
}

export function ButtonLike({
  children,
  ...props
}: React.HTMLProps<HTMLLabelElement>) {
  const className = useMemo(() => {
    return `button-like ${props.className}`;
  }, [props.className]);
  return <label className={className}>{children}</label>;
}
