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
    let response = {};

    try {
      payload.headers = { ...this.defaults.headers, ...payload.headers };
      payload.responseType = payload.responseType || this.defaults.responseType;
      payload = this.interceptors.request(payload);

      var fetch_response = await fetch(payload.url, payload);

      // Define a custom response object
      response = {
        status: fetch_response.status,
        url: fetch_response.url,
        ok: fetch_response.ok,
        responseType: payload.responseType,
        data: null,
        error: null,
        headers: Object.fromEntries(fetch_response.headers.entries()),
      };

      if (!response.ok) return this._error(response, fetch_response.statusText);

      const responseParsers = {
        json: (res) => res.json(),
        text: (res) => res.text(),
        blob: (res) => res.blob(),
        stream: (res) => res.body, // Don't await ReadableStream
      };

      if (!responseParsers[payload.responseType]) {
        return this._error(response, `ResponseType ${payload.responseType} not supported`);
      }

      response.data = await (payload.responseType === "stream" ? responseParsers.stream(fetch_response) : responseParsers[payload.responseType](fetch_response));
      return this._response(response);
    } catch (error) {
      return this._error(response, error.message || "Something went wrong");
    }
  },

  // HELPER FUNCTIONS
  get: (url) => fetcher.request({ method: "get", url }),
  post: (url, data) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null }),
  download: (url, data = null) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null, responseType: "blob" }),
  upload: (url, data = null) => fetcher.request({ method: "post", url, body: data instanceof FormData ? data : JSON.stringify(data) }),
  stream: (url) => fetcher.request({ method: "get", url, responseType: "stream" }),

  // INTERNAL FUNCTIONS

  _response(response) {
    let resp = this.interceptors.response(response);
    if (!resp) resp = response;
    return { data: resp.data, error: null };
  },

  _error(response, message) {
    response.error = message;
    response.ok = false;
    response.data = null;
    response.status = response.status || 500;
    let resp = this.interceptors.error(response);
    if (!resp) resp = response;
    return { data: null, error: resp.error };
  },
};

export default fetcher;
