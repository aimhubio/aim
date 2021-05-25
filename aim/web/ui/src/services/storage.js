export function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {}
}

export function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {}
}

export function clear() {
  try {
    localStorage.clear();
  } catch (error) {}
}
