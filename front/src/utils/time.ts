export function addMonths(date: Date, numMonths: number) {
  return new Date(date.setMonth(date.getMonth() + numMonths));
}

export function addDays(date: Date, numDays: number) {
  return new Date(date.setDate(date.getDate() + numDays));
}

export function addMinutes(date: Date, numMins: number) {
  return new Date(date.setMinutes(date.getMinutes() + numMins));
}

export function addHours(date: Date, numHrs: number) {
  return new Date(date.setHours(date.getHours() + numHrs));
}

export function formatTimeString(timeIncrement: number) {
  if (timeIncrement < 10) {
    return `0${timeIncrement}`;
  }
  return timeIncrement;
}
