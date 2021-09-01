export function setItem(key: string, value: any) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {}
}

export function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {}
}

export function clear() {
  try {
    localStorage.clear();
  } catch (error) {}
}
