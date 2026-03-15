import { AppProvider } from "./lib/AppContext";
import { HomePage } from "./pages/HomePage";

const App = () => {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
};

export default App;
