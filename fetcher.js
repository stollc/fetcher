class FetcherError extends Error {
  constructor(o) {
    super(o.message);
    this.status = o.status;
    this.url = o.url;
    if (o.name) this.name = o.name;
    Error.captureStackTrace?.(this, FetcherError);
  }
}

function resp(isError, data, error) {
  return { isError, data, error };
}

const fetcher = {
  // PROPERTIES
  defaults: {
    headers: {},
    responseType: "json",
  },

  // INTERCEPTORS
  interceptors: {
    request: (payload) => payload,
    response: (response) => response,
    error: (error) => error,
  },

  // REQUEST HANDLER
  async request(payload) {
    try {
      payload.headers = { ...this.defaults.headers, ...payload.headers };
      payload.responseType = payload.responseType || this.defaults.responseType;
      payload = this.interceptors.request(payload);

      let response = await fetch(payload.url, payload);
      if (!response.ok) throw new FetcherError({ message: response.statusText, status: response.status, url: response.url });

      const responseParsers = {
        json: (res) => res.json(),
        text: (res) => res.text(),
        blob: (res) => res.blob(),
        stream: (res) => res.body, // Don't await ReadableStream
      };

      if (!responseParsers[payload.responseType]) {
        throw new FetcherError({ message: `ResponseType ${payload.responseType} not supported`, status: response.status, url: response.url });
      }

      response.data = await (payload.responseType === "stream" ? responseParsers.stream(response) : responseParsers[payload.responseType](response));
      response.responseType = payload.responseType;
      response = this.interceptors.response(response);

      return resp(false, response.data);
    } catch (error) {
      if (error instanceof FetcherError) {
        error.message = error.message || (error.status == 405 ? "Method Not Allowed" : "Something went wrong");
      } else if (error instanceof Error) {
        error = new FetcherError({ message: error.message || "Something went wrong", status: null, url: payload.url, name: error.name });
      }

      return this.interceptors.error(resp(true, null, error));
    }
  },

  // HELPER FUNCTIONS
  get: (url) => fetcher.request({ method: "get", url }),
  post: (url, data) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null }),
  download: (url, data = null) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null, responseType: "blob" }),
  upload: (url, data = null) => fetcher.request({ method: "post", url, body: data instanceof FormData ? data : JSON.stringify(data) }),
  stream: (url) => fetcher.request({ method: "get", url, responseType: "stream" }),
};

export default fetcher;
