import "./Star.css";

export interface StarProps {
  level: "gold" | "silver" | "bronze";
}

export function Star({ level }: StarProps) {
  return <span className={`star level-${level}`}>★</span>;
}
