export const trainerRoutes = [
  { path: '/trainers', name: 'trainers', component: () => import('../../pages/TrainersPage.vue') },
  { path: '/trainers/:topicId', name: 'trainer-session', component: () => import('../../pages/TrainerSessionPage.vue') },
]
