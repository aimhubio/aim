/**
 * @description Generates a random alphanumeric string of length 10
 * @returns a random alphanumeric string of length 10
 */
function generateId() {
  const alphanumeric =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length);
    id += alphanumeric.charAt(randomIndex);
  }

  return id;
}

export default generateId;
