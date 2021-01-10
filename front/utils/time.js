export function addMonths(date, numMonths) {
  return new Date(date.setMonth(date.getMonth() + numMonths));
}

export function addDays(date, numDays) {
  return new Date(date.setDate(date.getDate() + numDays));
}

export function formatTimeString(timeIncrement) {
  if (timeIncrement < 10) {
    return `0${timeIncrement}`;
  }
  return timeIncrement;
}
