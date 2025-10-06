// public/js/dashboard.js
window.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuthOrRedirect()) return;

  const hello  = document.getElementById("hello");
  const roleEl = document.getElementById("role");
  const whoami = document.getElementById("whoami");
  const result = document.getElementById("result");
  const actions= document.getElementById("actions");
  const regLink= document.getElementById("register-link");

  const refresh = async () => {
    try {
      const me = await Auth.me();
      hello.textContent = `Hello, ${me?.profile?.displayName || me.username}`;
      roleEl.textContent = me.role;
      whoami.textContent = `User: ${me.username} • ID: ${me.id}`;

      // Only admins see the registration link
      regLink.style.display = (me.role === "admin") ? "inline-block" : "none";

      // Render role-specific action buttons
      actions.innerHTML = "";
      const mkBtn = (text, path) => {
        const b = document.createElement("button");
        b.className = "primary";
        b.textContent = text;
        b.onclick = async () => {
          try {
            const data = await Auth.api(path);
            result.textContent = JSON.stringify(data, null, 2);
          } catch (e) {
            result.textContent = JSON.stringify(e.data || e, null, 2);
          }
        };
        return b;
      };

      const map = {
        "admin": [ mkBtn("List all users", "/admin/users") ],
        "platform_manager": [ mkBtn("Platform metrics", "/platform/metrics") ],
        "csr": [ mkBtn("My CSR cases", "/csr/cases") ],
        "person_in_need": [ mkBtn("My Case", "/pin/case") ],
      };
      (map[me.role] || []).forEach(btn => actions.appendChild(btn));

      // Show initial /me payload
      result.textContent = JSON.stringify(me, null, 2);
    } catch (e) {
      // Token invalid or expired -> back to login
      Auth.clearToken();
      location.href = "/login.html";
    }
  };

  document.getElementById("refresh").addEventListener("click", refresh);
  document.getElementById("logout").addEventListener("click", () => {
    Auth.clearToken();
    location.href = "/login.html";
  });

  await refresh();
});
