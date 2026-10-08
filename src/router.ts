import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/cards' },
    { path: '/cards', name: 'cards', component: () => import('./pages/CardsPage.vue') },
    { path: '/reading', name: 'reading', component: () => import('./pages/ReadingPage.vue') },
    { path: '/dictionary', name: 'dictionary', component: () => import('./pages/DictionaryPage.vue') },
    { path: '/verbs', name: 'verbs', component: () => import('./pages/VerbsPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/cards' },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

export default router
