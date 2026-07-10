import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist-uni';
export { default as usePageStore } from './modules/autoPage'

export const setupPinia = (app) => {
  const pinia = createPinia();
  pinia.use(piniaPersist);
  app.use(pinia);
};
