export const trainerRoutes = [
  { path: '/trainers', name: 'trainers', component: () => import('../../pages/TrainersPage.vue') },
  { path: '/trainers/dialogues', name: 'trainer-dialogues', component: () => import('../../pages/TrainerDialoguePage.vue') },
  { path: '/trainers/reading-comprehension', name: 'trainer-reading-comprehension', component: () => import('../../pages/TrainerReadingComprehensionPage.vue') },
  { path: '/trainers/vocabulary/match-pairs', name: 'trainer-vocabulary-match-pairs', component: () => import('../../pages/TrainerVocabularyMatchPage.vue') },
  { path: '/trainers/:topicId/fill-gaps', name: 'trainer-fill-gaps', component: () => import('../../pages/TrainerFillGapPage.vue') },
  { path: '/trainers/:topicId/multi-select', name: 'trainer-multi-select', component: () => import('../../pages/TrainerMultiSelectPage.vue') },
  { path: '/trainers/:topicId/order-items', name: 'trainer-order-items', component: () => import('../../pages/TrainerOrderItemsPage.vue') },
  { path: '/trainers/:topicId', name: 'trainer-session', component: () => import('../../pages/TrainerSessionPage.vue') },
]
