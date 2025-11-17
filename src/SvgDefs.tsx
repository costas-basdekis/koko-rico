import { cloneElement, isValidElement, ReactElement } from "react";

export const SvgDefinitionMap: Map<string, ReactElement> = new Map();

export function registerSvgDef(name: string, element: ReactElement, createGroup: boolean = true) {
  if (createGroup) {
    element = <g id={name}>{element}</g>;
  }
  if (isValidElement(element)) {
    element = cloneElement(element, {key: name});
  } else {
    element = <g key={name}>{element}</g>
  }
  SvgDefinitionMap.set(name, element);
}

export function makeAndRegisterSvgDef(name: string, element: ReactElement, createGroup: boolean = true) {
  registerSvgDef(name, element, createGroup);
  const href = `#${name}`;
  return function UseElement(props: React.SVGProps<SVGUseElement>) {
    return <use href={href} {...props} />;
  }
}

export function SvgDefs() {
  return (
    <defs>
      {Array.from(SvgDefinitionMap.values())}
    </defs>
  );
}
