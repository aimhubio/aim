function makeAPIRequest(url: string, options: {}): Promise<{}> {
  return new Promise((resolve, reject) => {
    fetch(url, options).then(response => response.json()).then(data => resolve(data)).catch(err => {
      if (err.name === 'AbortError') {
        // Fetch aborted
      } else {
        reject(err);
      }
    });
  });
}

function get(url: string, options: {}) {
  return makeAPIRequest(url, {
    method: 'GET',
    ...options,
  });
}

function post(url: string, data: {}, options: {}) {
  return makeAPIRequest(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify(data),
  });
}

function put(url: string, data: {}, options: {}) {
  return makeAPIRequest(url, {
    method: 'PUT',
    ...options,
    body: JSON.stringify(data),
  });
}

function remove(url: string, options: {}) {
  return makeAPIRequest(url, {
    method: 'DELETE',
    ...options,
  });
}

const API = {
  get,
  post,
  put,
  delete: remove,
};

export default API;
