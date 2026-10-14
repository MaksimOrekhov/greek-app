export const theoryRoutes = [
  { path: '/theory', name: 'theory', component: () => import('../../pages/TheoryPage.vue') },
  { path: '/theory/reading', name: 'theory-reading', component: () => import('../../pages/ReadingPage.vue') },
  { path: '/theory/:topicId', name: 'theory-topic', component: () => import('../../pages/TheoryTopicPage.vue') },
]

export const legacyReadingRoute = { path: '/reading', name: 'reading-legacy', redirect: '/theory/reading' }
