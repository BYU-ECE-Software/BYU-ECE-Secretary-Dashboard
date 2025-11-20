import { createRouter, createWebHistory } from "vue-router";
import AdminPanel from "@/views/AdminPanel.vue";
import StudentDetail from "@/views/StudentDetail.vue";
import Home from "@/views/Home.vue";
import Register from "@/views/Registration.vue";
import Students from "@/views/Students.vue";
import Lockers from "@/views/Lockers.vue";
import DoorCodes from "@/views/DoorCodes.vue";
import Desks from "@/views/Desks.vue";
import Keys from "@/views/Keys.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  {
    path: "/student/:id",
    name: "StudentDetail",
    component: StudentDetail,
    props: true,
  },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
    meta: { pageTitle: "ADMIN PANEL" },
  },
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
  history: createWebHistory(),
  routes,
});

export default router;
