/**
 * @param {any} item  the thing to check if it exists
 * @param {(string | () => string)} renderExpression - string to return or function to run if the first item is true. If it is a function, it *must* eval to a string
 */
export function existsAndRender(item, renderExpression) {
  if (item) {
    return typeof renderExpression === "string"
      ? renderExpression
      : renderExpression();
  }
  return "";
}
