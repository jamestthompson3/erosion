export function isEqual(a, b) {
  if (a === b) return true;

  if (typeof a != "object" || typeof b != "object" || a == null || b == null)
    return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length != keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key)) return false;

    if (typeof a[key] === "function" || typeof b[key] === "function") {
      if (a[key].toString() != b[key].toString()) return false;
    } else {
      if (!isEqual(a[key], b[key])) return false;
    }
  }
  const valsA = Object.values(a);
  const valsB = Object.values(b);
  for (let value of valsA) {
    const foundValue = valsB.find(v => isEqual(value, v));
    if (!foundValue) return false;
  }

  return true;
}
