type Renderable = string | (() => string);

export function existsAndRender(
  item: any,
  renderExpression: Renderable
): string {
  if (Boolean(item)) {
    return typeof renderExpression === "string"
      ? renderExpression
      : renderExpression();
  }
  return "";
}

type EventFunction<T> = (e: T) => void;
export function debounceEvent<T>(fn: EventFunction<T>, time: number) {
  let debounced: number;
  return function (e) {
    if (debounced) {
      clearTimeout(debounced);
    }
    debounced = setTimeout(() => fn(e), time);
  };
}
