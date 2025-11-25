import { cloneElement, isValidElement, ReactElement, useMemo } from "react";

export const SvgDefinitionMap: Map<string, ReactElement> = new Map();

export function registerSvgDef(name: string, element: ReactElement, createGroup: boolean = true): ReactElement {
  if (createGroup) {
    element = <g id={name}>{element}</g>;
  }
  if (isValidElement(element)) {
    element = cloneElement(element, {key: name});
  } else {
    element = <g key={name}>{element}</g>
  }
  SvgDefinitionMap.set(name, element);
  return element;
}

export type SvgUseWithDef = {
    (props: React.SVGProps<SVGUseElement>): JSX.Element;
    SvgDef: ReactElement;
};

export function makeAndRegisterSvgDef(name: string, element: ReactElement, createGroup: boolean = true): SvgUseWithDef {
  const svgDef = registerSvgDef(name, element, createGroup);
  const href = `#${name}`;
  function UseElement(props: React.SVGProps<SVGUseElement>) {
    return <use href={href} {...props} />;
  }
  UseElement.SvgDef = svgDef;
  return UseElement;
}

export function SvgDefs() {
  const defs = useMemo(() => {
    return Array.from(SvgDefinitionMap.values());
  }, []);
  return (
    <defs>
      {defs}
    </defs>
  );
}
