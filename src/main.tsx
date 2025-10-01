import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
