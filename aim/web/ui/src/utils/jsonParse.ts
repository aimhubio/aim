export function jsonParse(value: string) {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return JSON.parse(value);
}
