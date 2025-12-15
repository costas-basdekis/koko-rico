export function getLSBoolean(
  key: string,
  defaultValue: boolean = false,
): boolean {
  const valueStr = localStorage.getItem(key);
  if (!valueStr) {
    return defaultValue;
  }
  return valueStr === "true";
}

export function setLSBoolean(key: string, value: boolean) {
  localStorage.setItem(key, `${value}`);
}
