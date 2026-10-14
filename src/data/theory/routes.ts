export const theoryRoutes = [
  { path: '/theory', name: 'theory', component: () => import('../../pages/TheoryPage.vue') },
  { path: '/theory/:topicId', name: 'theory-topic', component: () => import('../../pages/TheoryTopicPage.vue') },
]
