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
    request(payload) {
      return payload;
    },
    response(response) {
      return response;
    },
    error(error) {
      return error;
    },
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
      };

      if (!responseParsers[payload.responseType]) throw new FetcherError({ message: `ResponseType ${payload.responseType} not supported`, status: response.status, url: response.url });

      response.data = await responseParsers[payload.responseType](response);
      response.responseType = payload.responseType;
      response = this.interceptors.response(response);

      return resp(false, response.data);
    } catch (error) {
      if (error instanceof FetcherError) {
        error.message ||= error.status == 405 ? "Method Not Allowed" : "Something went wrong";
      } else if (error instanceof Error) {
        let fetcher_error = new FetcherError({ message: error.message || "Something went wrong", status: null, url: payload.url, name: error.name });
        error = fetcher_error;
      }

      let e = resp(true, null, error);
      return this.interceptors.error(e);
    }
  },

  // HELPER FUNCTIONS
  async get(url) {
    return await this.request({ method: "get", url });
  },
  async post(url, data) {
    return await this.request({ method: "post", url, body: data ? JSON.stringify(data) : null });
  },
  async download(url, data = null) {
    return await this.request({ method: "post", url, body: data ? JSON.stringify(data) : null, responseType: "blob" });
  },
  async upload(url, data = null) {
    return await this.request({ method: "post", url, body: data instanceof FormData ? data : JSON.stringify(data) });
  },
};

export default fetcher;
