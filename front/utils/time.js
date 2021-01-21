export function addMonths(date, numMonths) {
  return new Date(date.setMonth(date.getMonth() + numMonths));
}

export function addDays(date, numDays) {
  return new Date(date.setDate(date.getDate() + numDays));
}

export function addMinutes(date, numMins) {
  return new Date(date.setMinutes(date.getMinutes() + numMins));
}

export function addHours(date, numHrs) {
  return new Date(date.setHours(date.getHours() + numHrs));
}

export function formatTimeString(timeIncrement) {
  if (timeIncrement < 10) {
    return `0${timeIncrement}`;
  }
  return timeIncrement;
}
