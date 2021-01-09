export function addMonths(date, numMonths) {
  return new Date(date.setMonth(date.getMonth() + numMonths));
}

export function addDays(date, numDays) {
  return new Date(date.setDate(date.getDate() + numDays));
}
