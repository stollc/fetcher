const fetcher = {
  // PROPERTIES
  defaults: {
    headers: { "Content-Type": "application/json" },
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
      };

      if (!responseParsers[payload.responseType]) {
        return this._error(response, `ResponseType ${payload.responseType} not supported`, 400);
      }

      response.data = await responseParsers[payload.responseType](fetch_response);
      return this._response(response);
    } catch (error) {
      return this._error(response, error.message, 500);
    }
  },

  // HELPER FUNCTIONS
  get: (url) => fetcher.request({ method: "get", url }),
  post: (url, data) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null }),
  download: (url, data = null) => fetcher.request({ method: "post", url, body: data ? JSON.stringify(data) : null, responseType: "blob" }),
  upload: (url, data = null) => fetcher.request({ method: "post", url, body: data instanceof FormData ? data : JSON.stringify(data) }),

  // INTERNAL FUNCTIONS
  _response(response) {
    let resp = this.interceptors.response(response);
    if (!resp) resp = response;
    return { data: resp.data, error: null };
  },

  _error(response, message, status) {
    const statusMessages = {
      400: "Bad Request - The server could not understand the request.",
      401: "Unauthorized - Authentication is required.",
      403: "Forbidden - You don't have permission to access this resource.",
      404: "Not Found - The requested resource could not be found.",
      408: "Request Timeout - The server timed out waiting for the request.",
      429: "Too Many Requests - You have hit the rate limit.",
      500: "Internal Server Error - Something went wrong on the server.",
      502: "Bad Gateway - Received an invalid response from the upstream server.",
      503: "Service Unavailable - The server is currently unavailable.",
      504: "Gateway Timeout - The server didn't respond in time.",
    };
    status = status || response.status || 500;
    response.error = message || statusMessages[status] || "Unknown error";
    response.ok = false;
    response.data = null;
    response.status = status;
    let resp = this.interceptors.error(response);
    if (!resp) resp = response;
    return { data: null, error: resp.error };
  },
};

export default fetcher;
