import { createWebHistory, createRouter } from "vue-router";

const routes = [
	{
		path: "/",
		name: "Office",
		component: () => import("./pages/Office.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior: () => ({ left: 0, top: 0 }),
});
export default router;
