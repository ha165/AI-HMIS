import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import AppProvider from "./Context/AppContext.jsx";
import store from "./Redux/Store.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AppProvider>
);
