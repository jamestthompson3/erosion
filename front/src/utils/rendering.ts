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

type EventFunction = (e: Event) => void;

export function debounceEvent(fn: EventFunction, time: number) {
  let debounced: number;
  return function (e: Event) {
    if (debounced) {
      clearTimeout(debounced);
    }
    debounced = setTimeout(() => fn(e), time);
  };
}

export function createCardColor(): string {
  const colors = [
    "#7400b8ff",
    "#6930c3ff",
    "#5e60ceff",
    "#5390d9ff",
    "#4ea8deff",
    "#48bfe3ff",
    "#56cfe1ff",
    "#64dfdfff",
    "#72efddff",
    "#80ffdbff",
  ];
  const rand = () => ~~(Math.random() * 9);
  return colors[rand()];
}
