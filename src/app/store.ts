import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import localForage from "localforage";
import candidatesReducer from "../features/candidatesSlice";
// Example: we'll add candidatesSlice later
// import candidatesReducer from "../features/candidatesSlice";

const rootReducer = combineReducers({
  candidates: candidatesReducer,
});

const persistConfig = {
  key: "root",
  storage: localForage, // uses IndexedDB under the hood
  whitelist: ["candidates"], // state slices to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
