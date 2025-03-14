# Fetcher - Simple Fetch Wrapper

Fetcher is a lightweight wrapper around the Fetch API that includes request/response interceptors, error handling, and helper functions for common HTTP requests.

## Installation

```sh
npm install @stollc/fetcher
```

## Usage

### Importing Fetcher

```javascript
import fetcher from "@stollc/fetcher";
```

### Setting Up Interceptors

```javascript
fetcher.interceptors.request = (payload) => {
  console.log("REQ", payload);
  return payload;
};

fetcher.interceptors.response = (response) => {
  console.log("RES", response);
  return response;
};

fetcher.interceptors.error = (error) => {
  console.log("ERR", error);
  return error;
};
```

### Making Requests

#### Generic Request

```javascript
const payload = {
  method: "post",
  url: "https://httpbin.org/post",
  body: JSON.stringify({ key: "value" }),
  responseType: "json", // json, text, blob, stream
  headers: { "Content-Type": "application/json" },
};

const result = await fetcher.request(payload);
```

#### Using Helper Functions

```javascript
const getResult = await fetcher.get("https://httpbin.org/get");
const postResult = await fetcher.post("https://httpbin.org/post", { name: "John Doe" });
const downloadResult = await fetcher.download("https://httpbin.org/download");
const uploadResult = await fetcher.upload("https://httpbin.org/upload", formData);
const streamResult = await fetcher.stream("https://httpbin.org/stream/10");
```

### Handling Streams

```javascript
const response = await fetcher.stream("https://httpbin.org/stream/10");

if (response.isError) {
  console.error("Stream Error:", response.error);
} else {
  const reader = response.data.getReader();
  const decoder = new TextDecoder();

  async function readStream() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value));
    }
  }

  readStream();
}
```

## License

MIT
