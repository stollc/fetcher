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

const get = await fetcher.get("https://httpbin.org/get");
```
