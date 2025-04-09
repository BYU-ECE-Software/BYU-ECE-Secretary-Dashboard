import { createRouter, createWebHistory } from "vue-router";
import AdminPanel from "@/views/AdminPanel.vue";
import StudentDetail from "@/views/StudentDetail.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Registration.vue"

const routes = [
  { path: "/", name: "Home", component: Login },
  { path: "/student/:id", name: "StudentDetail", component: StudentDetail, props: true, },//meta: { requiresAuth: true } },
  { path: "/admin", name: "AdminPanel", component: AdminPanel, },//meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },

];

const router = createRouter({
  history: createWebHistory(), // Ensure you're using createWebHistory()
  routes
});

router.beforeEach(async (to, from, next) => {
  const user = await checkAuth(); // Fetch user from API or session

  if (to.meta.requiresAuth && !user) {
    return next('/login');
  }

  if (to.meta.requiresAdmin && (!user || !user.admin)) {
    return next('/dashboard'); // Redirect non-admins
  }

  next();
});

async function checkAuth() {
  try {
    const response = await fetch('/api/user', { credentials: 'include' });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export default router;
