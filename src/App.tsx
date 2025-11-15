import HomePage from "./pages/HomePage";
import { SpeedDialProvider } from "./context/SpeedDialContext";

export default function App() {
  return (
    <SpeedDialProvider>
      <HomePage />
    </SpeedDialProvider>
  );
}