import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(payload) {
  const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
  return res.data;
}

export async function loginUser(payload) {
  const res = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
  const { access_token } = res.data;
  localStorage.setItem("token", access_token);
  return access_token;
}

export function logoutUser() {
  localStorage.removeItem("token");
}

export async function fetchCurrentUser() {
  const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function fetchContacts(params = {}) {
  const res = await axios.get(`${API_BASE_URL}/api/contacts`, {
    params,
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function createContact(payload) {
  const res = await axios.post(`${API_BASE_URL}/api/contacts`, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function updateContact(id, payload) {
  const res = await axios.put(`${API_BASE_URL}/api/contacts/${id}`, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function deleteContact(id) {
  await axios.delete(`${API_BASE_URL}/api/contacts/${id}`, {
    headers: getAuthHeaders()
  });
}

export async function toggleFavorite(id) {
  const res = await axios.patch(
    `${API_BASE_URL}/api/contacts/${id}/favorite`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return res.data;
}

export async function fetchContactById(id) {
  const res = await axios.get(`${API_BASE_URL}/api/contacts/${id}`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

