import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor for 401 errors on this instance
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Separate login APIs
export const loginAdmin = (data) =>
  API.post("/admin/login", data);

export const loginReceptionist = (data) =>
  API.post("/receptionist/login", data);

export const loginDoctor = (data) =>
  API.post("/doctor/login", data);

export const loginScanner = (data) =>
  API.post("/scanner/login", data);

export const loginBiller = (data) =>
  API.post("/biller/login", data);

export const loginLab = (data) =>
  API.post("/lab/login", data);
