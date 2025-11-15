import { ReactNode } from "react";
import { SvgDefs } from "./SvgDefs";

export interface SvgContainerProps {
  children?: ReactNode;
}

export function SvgContainer({children}: SvgContainerProps) {
  return (
      <svg width={1000} height={1000}>
        <SvgDefs />
        {children}
      </svg>
  );
}
