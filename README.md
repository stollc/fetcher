# Fetcher - Simple Fetch Wrapper

## **Usage Example**

### **Importing Fetcher**

```js
import fetcher from "./fetcher";
```

---

### **Setting Up Interceptors**

```js
fetcher.interceptors.request = function (payload) {
  console.log("Request Interceptor:", payload);
  return payload;
};

fetcher.interceptors.response = function (response) {
  console.log("Response Interceptor:", response);
  return response;
};

fetcher.interceptors.error = function (error) {
  console.error("Error Interceptor:", error);
  return error;
};
```

---

### **Making a Request**

```js
const payload = {
  method: "post",
  url: "https://httpbin.org/post",
  body: JSON.stringify({ key: "value" }),
  responseType: "json", // json, text, or blob
  headers: { "Content-Type": "application/json" },
};

const results = await fetcher.request(payload);
console.log("Fetch Results:", results);
```

---

### **Using Helper Methods**

```js
const getResponse = await fetcher.get("https://httpbin.org/get");
console.log("GET Response:", getResponse);

const postResponse = await fetcher.post("https://httpbin.org/post", { key: "value" });
console.log("POST Response:", postResponse);

const downloadResponse = await fetcher.download("https://httpbin.org/image");
console.log("Download Response:", downloadResponse);

const formData = new FormData();
formData.append("file", new Blob(["Hello World"], { type: "text/plain" }), "hello.txt");

const uploadResponse = await fetcher.upload("https://httpbin.org/post", formData);
console.log("Upload Response:", uploadResponse);
```

---

### **Features**

- ✅ Supports `GET`, `POST`, `DOWNLOAD`, and `UPLOAD` requests.
- ✅ Customizable interceptors for requests, responses, and errors.
- ✅ Automatically parses JSON, text, and blob responses.
- ✅ Error handling with `FetcherError` for better debugging.

🚀 **Enjoy seamless API requests with Fetcher!**
