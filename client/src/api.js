import axios from "axios";

const API = "/api";

export const getWords = (page = 1, limit = 5) =>
  axios.get(`${API}/words`, { params: { page, limit } }).then((r) => r.data);
export const createWord = (data) =>
  axios.post(`${API}/words`, data).then((r) => r.data);
export const updateWord = (id, data) =>
  axios.put(`${API}/words/${id}`, data).then((r) => r.data);
export const deleteWord = (id) =>
  axios.delete(`${API}/words/${id}`).then((r) => r.data);

export const exportWords = () => axios.get(`${API}/words/export`).then((r) => r.data);
export const importWords = (words) =>
  axios.post(`${API}/words/import`, { words }).then((r) => r.data);

export const getFlashcards = (random) =>
  axios
    .get(`${API}/flashcards`, { params: { random: random ? "true" : "false" } })
    .then((r) => r.data);

export const getQuiz = (count, random) =>
  axios
    .get(`${API}/quiz`, {
      params: { count, random: random ? "true" : "false" },
    })
    .then((r) => r.data);

// vocab2 (jp <-> en)
export const getVocab2 = (page = 1, limit = 10) =>
  axios.get(`${API}/vocab2`, { params: { page, limit } }).then((r) => r.data);
export const createVocab2 = (data) =>
  axios.post(`${API}/vocab2`, data).then((r) => r.data);
export const deleteVocab2 = (id) =>
  axios.delete(`${API}/vocab2/${id}`).then((r) => r.data);

export const exportVocab2 = () => axios.get(`${API}/vocab2/export`).then((r) => r.data);
export const importVocab2 = (vocab) =>
  axios.post(`${API}/vocab2/import`, { vocab }).then((r) => r.data);

export const getVocab2Flashcards = (random, dir) =>
  axios
    .get(`${API}/vocab2/flashcards`, {
      params: { random: random ? "true" : "false", dir },
    })
    .then((r) => r.data);
