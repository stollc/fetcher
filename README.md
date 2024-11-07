# fetcher

```js
import fetcher from "./fetcher";

// interceptors
fetcher.interceptors.request = function (payload) {
  console.log("REQ");
  return payload;
};

fetcher.interceptors.response = function (response) {
  console.log("RES");
  return response;
};

fetcher.interceptors.error = function (error) {
  console.log("ERR");
  return error;
};

// fetch
const payload = {
  method: "post",
  url: url,
  body: JSON.stringify(data),
  responseType: "json", // json, text, blob
  headers: { "Content-Type": "application/json" },
};
const results = await fetcher.request(payload);

// helpers (get, post, download, upload)
const get = await fetcher.get("https://httpbin.org/get");
```
