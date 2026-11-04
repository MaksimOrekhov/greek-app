export const trainerRoutes = [
  { path: '/trainers', name: 'trainers', component: () => import('../../pages/TrainersPage.vue') },
  { path: '/trainers/:topicId/fill-gaps', name: 'trainer-fill-gaps', component: () => import('../../pages/TrainerFillGapPage.vue') },
  { path: '/trainers/:topicId/multi-select', name: 'trainer-multi-select', component: () => import('../../pages/TrainerMultiSelectPage.vue') },
  { path: '/trainers/:topicId', name: 'trainer-session', component: () => import('../../pages/TrainerSessionPage.vue') },
]
