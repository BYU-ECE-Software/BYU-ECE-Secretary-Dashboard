import axios from "axios";

// Single shared HTTP client for the whole app
const http = axios.create({
  // comment out the baseURL you are not using
  // for local development
  // baseURL: "http://localhost:3000/api",
  // for docker use
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default http;
