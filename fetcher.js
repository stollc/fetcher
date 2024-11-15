class FetcherError extends Error {
  constructor(o) {
    super(o.message);
    this.status = o.status;
    this.url = o.url;
    if (o.name) this.name = o.name;
    if (o.stack) this.stack = o.stack;
  }
}

function err(message, status, url, name, stack) {
  if (!message) {
    if (status == 405) message = "Method not allowed";
    else message = "Something went wrong";
  }
  let e = resp(true, null, { message, status, url, name, stack });

  e = fetcher.interceptors.error(e);
  return e;
}

function resp(isError, data, error) {
  return { isError, data, error };
}

const fetcher = {
  // PROPERTIES
  defaults: {
    headers: { "Content-Type": "application/json" },
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
      payload.responseType = !payload.responseType ? this.defaults.responseType : payload.responseType;
      payload = this.interceptors.request(payload);

      let response = await fetch(payload.url, payload);

      if (!response.ok) throw new FetcherError({ message: response.statusText, status: response.status, url: response.url });

      let data = null;
      if (payload.responseType.toLowerCase() == "json") data = await response.json();
      else if (payload.responseType.toLowerCase() == "text") data = await response.text();
      else if (payload.responseType.toLowerCase() == "blob") data = await response.blob();
      else throw new FetcherError({ message: `ResponseType ${payload.responseType} not supported`, status: response.status, url: response.url });

      response.data = data;
      response.responseType = payload.responseType;

      this.interceptors.response(response);

      return resp(false, data);
    } catch (error) {
      if (error instanceof FetcherError) {
        if (!error.message) {
          if (error.status == 405) error.message = "Method Not Allowed";
          else error.message = "Something went wrong";
        }
      } else if (error instanceof Error) {
        var message = JSON.stringify(error.message || "Something went wrong");
        let fetcher_error = new FetcherError({ message, status: null, url: payload.url, name: error.name, stack: error.stack });
        error = fetcher_error;
      }

      let e = resp(true, null, error);
      e = fetcher.interceptors.error(e);
      return e;
    }
  },

  // HELPER FUNCTIONS
  async get(url) {
    const payload = {
      method: "get",
      url: url,
    };
    return await this.request(payload);
  },
  async post(url, data) {
    const payload = {
      method: "post",
      url: url,
      body: !data ? null : JSON.stringify(data),
    };
    return await this.request(payload);
  },
  async download(url, data = null) {
    const payload = {
      method: "post",
      url: url,
      body: !data ? null : JSON.stringify(data),
      responseType: "blob",
    };
    return await this.request(payload);
  },
  async upload(url, data = null) {
    const payload = {
      method: "post",
      url: url,
      headers: { "Content-Type": "multipart/form-data" },
      body: !data ? null : JSON.stringify(data),
    };
    return await this.request(payload);
  },
};

export default fetcher;
