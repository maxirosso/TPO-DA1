import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
  // el middleware se configura automáticamente con valores predeterminados sensatos
});

export default store;