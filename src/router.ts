import { createRouter, createWebHashHistory } from 'vue-router'
import { legacyReadingRoute, theoryRoutes } from './data/theory/routes'
import { resolveScrollBehavior } from './lib/scrollBehavior'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/cards' },
    { path: '/cards', name: 'cards', component: () => import('./pages/CardsPage.vue') },
    legacyReadingRoute,
    ...theoryRoutes,
    { path: '/dictionary', name: 'dictionary', component: () => import('./pages/DictionaryPage.vue') },
    { path: '/verbs', name: 'verbs', component: () => import('./pages/VerbsPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/cards' },
  ],
  scrollBehavior: resolveScrollBehavior,
})

export default router
