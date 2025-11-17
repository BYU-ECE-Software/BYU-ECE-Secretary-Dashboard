import axios from "axios";

// Single shared HTTP client for the whole app
const http = axios.create({
  baseURL: "/api", // change this depending on the server you are on local docker can just be /api
  headers: { "Content-Type": "application/json" },
});

export default http;
