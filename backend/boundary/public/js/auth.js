// boundary/public/js/auth.js
const Auth = (() => {
  const API = (p) => `${location.origin}${p}`;
  const setToken   = (t) => localStorage.setItem("token", t);
  const getToken   = () => localStorage.getItem("token");
  const clearToken = () => localStorage.removeItem("token");

  async function api(path, opts = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(API(path), { ...opts, headers });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!res.ok) throw { status: res.status, data, message: data?.error || "Request failed" };
    return data;
  }

  async function login(username, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    return data.user;
  }

  async function me() { return api("/me"); }

  function requireAuthOrRedirect() {
    if (!getToken()) { location.href = "/login.html"; return false; }
    return true;
  }

  return { api, login, me, setToken, getToken, clearToken, requireAuthOrRedirect };
})();
