import { useDashboardStore } from "./hooks/useDashboardStore";

function App() {
  const store = useDashboardStore();

  return (
    <div className="text-white p-5">
      <h1 className="text-xl font-bold">Speed Dial Dashboard</h1>
      <pre>{JSON.stringify(store.state, null, 2)}</pre>
    </div>
  );
}

export default App;
