import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

export const commitRound = async () => (await api.post("/api/rounds/commit")).data;
export const startRound = async (id, data) => (await api.post(`/api/rounds/${id}/start`, data)).data;
export const revealRound = async (id) => (await api.post(`/api/rounds/${id}/reveal`)).data;
export const verifyRound = async (params) => (await api.get("/api/verify", { params })).data;

export default api;
