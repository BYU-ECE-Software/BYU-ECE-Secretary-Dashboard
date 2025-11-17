import { createRouter, createWebHistory } from "vue-router";
import AdminPanel from "@/views/AdminPanel.vue";
import StudentDetail from "@/views/StudentDetail.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Registration.vue";
import Students from "@/views/Students.vue";
import Lockers from "@/views/Lockers.vue";
import DoorCodes from "@/views/DoorCodes.vue";
import Desks from "@/views/Desks.vue";
import Keys from "@/views/Keys.vue";

const routes = [
  { path: "/", name: "Home", component: Login },
  {
    path: "/student/:id",
    name: "StudentDetail",
    component: StudentDetail,
    props: true,
  }, //meta: { requiresAuth: true } },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
    meta: { pageTitle: "ADMIN PANEL" },
  }, //meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/students",
    name: "Students",
    component: Students,
    meta: { pageTitle: "STUDENTS" },
  },
  {
    path: "/lockers",
    name: "Lockers",
    component: Lockers,
    meta: { pageTitle: "LOCKERS" },
  },
  {
    path: "/doorcodes",
    name: "DoorCodes",
    component: DoorCodes,
    meta: { pageTitle: "DOOR CODES" },
  },
  {
    path: "/desks",
    name: "Desks",
    component: Desks,
    meta: { pageTitle: "DESKS" },
  },
  {
    path: "/keys",
    name: "Keys",
    component: Keys,
    meta: { pageTitle: "KEYS" },
  },
];

const router = createRouter({
  history: createWebHistory(), // Ensure you're using createWebHistory()
  routes,
});

router.beforeEach(async (to, from, next) => {
  const user = await checkAuth(); // Fetch user from API or session

  if (to.meta.requiresAuth && !user) {
    return next("/login");
  }

  if (to.meta.requiresAdmin && (!user || !user.admin)) {
    return next("/dashboard"); // Redirect non-admins
  }

  next();
});

async function checkAuth() {
  try {
    const response = await fetch("/api/user", { credentials: "include" });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export default router;
