import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/public",
});

export const fetchPatientHistory = (patientId) => API.get(`/patient-history/${patientId}`);
