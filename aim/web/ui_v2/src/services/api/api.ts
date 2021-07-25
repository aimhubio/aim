import { API_HOST } from 'config/config';
import { Stream } from 'stream';

function createAPIRequestWrapper<ResponseDataType>(
  url: string,
  options: RequestInit = {},
  stream?: boolean,
) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    call: () =>
      new Promise((resolve: (data: ResponseDataType) => void, reject) => {
        fetch(`${API_HOST}/${url}`, { ...options, signal })
          .then((response) => (stream ? response.body : response.json()))
          .then((data: ResponseDataType | ReadableStream) => {
            if (stream) {
              return streamHandler(data as ReadableStream);
            } else {
              resolve(data as ResponseDataType);
            }
          })
          .then((stream) => {
            // Respond with our stream
            return new Response(stream, {
              headers: { 'Content-Type': 'application/json' },
            }).json();
          })
          .catch((err) => {
            if (err.name === 'AbortError') {
              // Fetch aborted
            } else {
              reject(err);
            }
          });
      }),
    abort: () => controller.abort(),
  };
}

function streamHandler(data: ReadableStream) {
  const reader = data.getReader();
  return new ReadableStream({
    start(controller) {
      function push() {
        // "done" is a Boolean and value a "Uint8Array"
        reader.read().then((params: any) => {
          const { done, value } = params;
          // If there is no more data to read
          if (done) {
            console.log('done', done);
            controller.close();
            return;
          }
          // Get the data and send it to the browser via the controller

          // 1. Uint8Array to ArrayBuffer
          // 2. tuple
          // 3. decode
          // 4. fold tree to get JSON

          controller.enqueue(value);
          // Check chunks by logging to the console
          console.log(done, value);
          push();
        });
      }

      push();
    },
  });
}

function getStream<ResponseDataType>(
  url: string,
  params?: {},
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(
    `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    {
      method: 'GET',
      ...options,
    },
    true,
  );
}

function get<ResponseDataType>(
  url: string,
  params?: {},
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(
    `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    {
      method: 'GET',
      ...options,
    },
  );
}

function post<ResponseDataType>(
  url: string,
  data: Body,
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify(data),
  });
}

function put<ResponseDataType>(url: string, data: Body, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'PUT',
    ...options,
    body: JSON.stringify(data),
  });
}

function remove<ResponseDataType>(url: string, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'DELETE',
    ...options,
  });
}

const API = {
  get,
  getStream,
  post,
  put,
  delete: remove,
};

export default API;
