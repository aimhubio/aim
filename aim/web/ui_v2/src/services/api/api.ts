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
              streamHandlerThroughGenerator(data as ReadableStream);
            } else {
              resolve(data as ResponseDataType);
            }
          })
          .then((data: any) => {
            // Respond with our stream
            console.log('========', data);
            // return new Response(data, {
            //   headers: { 'Content-Type': 'application/json' },
            // }).json();
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
  let i = 0;
  let prevValue: Uint8Array;
  return new ReadableStream({
    start(controller) {
      async function push() {
        // "done" is a Boolean and value a "Uint8Array"
        const { done, value } = await reader.read();
        // If there is no more data to read
        if (done) {
          controller.close();
          return;
        }
        // Get the data and send it to the browser via the controller

        console.log(done, value);
        controller.enqueue(value);
        i++;
        push();
      }

      return push();
    },
  });
}

async function* makeStreamChunkIterator(data: ReadableStream) {
  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder('utf-8');
  let reader = data.getReader();
  let { value: chunk, done: readerDone } = await reader.read();

  // decode chunk
  chunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : '';

  let re = /\r\n|\n|\r/gm;
  let startIndex = 0;
  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk =
        remainder + (chunk ? utf8Decoder.decode(chunk, { stream: true }) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield utf8Encoder.encode(chunk.substr(startIndex, result.index));
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield utf8Encoder.encode(chunk.substr(startIndex));
  }
}

async function streamHandlerThroughGenerator(data: ReadableStream) {
  for await (const chunk of makeStreamChunkIterator(data)) {
    // console.log(chunk);
  }
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
