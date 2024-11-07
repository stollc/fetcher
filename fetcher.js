function err(message, status, url) {
  let e = resp(true, null, { message, status, url });
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

      if (!response.ok) return err(response.statusText, response.status, response.url);

      let data = null;
      if (payload.responseType.toLowerCase() == "json") data = await response.json();
      else if (payload.responseType.toLowerCase() == "text") data = await response.text();
      else if (payload.responseType.toLowerCase() == "blob") data = await response.blob();
      else return err(`ResponseType ${payload.responseType} not supported`, response.status, response.url);

      response.data = data;
      response.responseType = payload.responseType;

      this.interceptors.response(response);

      return resp(false, data);
    } catch (error) {
      return err(JSON.stringify(error.message || "Something went wrong"), 503, payload.url);
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
