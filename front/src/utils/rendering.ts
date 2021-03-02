type Renderable = string | (() => string);

export function existsAndRender(
  item: any,
  renderExpression: Renderable
): string {
  if (item) {
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

export function createCardColor(): string[] {
  const colors = [
    ["#7400b8", lightenDarkenColor("#7400b8", -40)],
    ["#6930c3", lightenDarkenColor("#6930c3", -40)],
    ["#5e60ce", lightenDarkenColor("#5e60ce", -40)],
    ["#5390d9", lightenDarkenColor("#5390d9", -40)],
    ["#4ea8de", lightenDarkenColor("#4ea8de", -40)],
    ["#48bfe3", lightenDarkenColor("#48bfe3", -40)],
    ["#56cfe1", lightenDarkenColor("#56cfe1", -40)],
    ["#64dfdf", lightenDarkenColor("#64dfdf", -40)],
    ["#72efdd", lightenDarkenColor("#72efdd", -40)],
    ["#80ffdb", lightenDarkenColor("#80ffdb", -40)],
  ];
  const rand = () => ~~(Math.random() * 9);
  return colors[rand()];
}

function lightenDarkenColor(col: string, amt: number) {
  let usePound = false;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

export function animationInterval(
  start: number,
  ms: number,
  signal: AbortSignal,
  callback: (time: number) => void
): void {

  function frame(time: number) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    if (signal.aborted) return;
    callback(roundedElapsed);
    scheduleFrame(time);
  }

  function scheduleFrame(time: number) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(frame), delay);
  }

  scheduleFrame(start);
}
