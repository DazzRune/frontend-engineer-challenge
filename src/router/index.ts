import Page404 from '@/pages/Page404.vue'
import PageNotify from '@/pages/PageNotify.vue'
import PageComplete from '@/pages/PageComplete.vue'
import { createRouter, createWebHistory } from 'vue-router'
import PageWelcomeback from '@/pages/PageWelcomeback.vue'
import PageWelcome from '@/pages/PageWelcome.vue'
import PageForm from '@/pages/PageForm.vue'
import { PAGES, URL_BASE } from '@/assets/scripts/constants'
import PageMenu from '@/pages/PageMenu.vue'

const routes = [
	// {
	// 	name: PAGES.menu,
	// 	path: "/",
	// 	component: PageMenu,
	// },
	{
		name: PAGES.login,
		path: `/${PAGES.login}`,
		component: PageForm,
	},
	{
		name: PAGES.welcomeback,
		path: `/${PAGES.welcomeback}`,
		component: PageWelcomeback,
	},
	{
		name: PAGES.register,
		path: `/${PAGES.register}`,
		component: PageForm,
	},
	{
		name: PAGES.welcome,
		path: `/${PAGES.welcome}`,
		component: PageWelcome,
	},
	{
		name: PAGES.reset,
		path: `/${PAGES.reset}`,
		component: PageForm,
	},
	{
		name: PAGES.notify,
		path: `/${PAGES.notify}`,
		component: PageNotify,
	},
	{
		name: PAGES.confirm,
		path: `/${PAGES.confirm}`,
		component: PageForm,
	},
	{
		name: PAGES.complete,
		path: `/${PAGES.complete}`,
		component: PageComplete,
	},
	{
		path: "/:pathMatch(.*)*", // маска для несуществующего маршрута
		// component: Page404,
		redirect: { name: PAGES.login }
	},
]

const router = createRouter({
	history: createWebHistory(URL_BASE),
	routes,
})

export default router
