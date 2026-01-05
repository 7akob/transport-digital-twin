import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CommandCenter } from "./pages/CommandCenter";
import { TopologyView } from "./pages/TopologyView";
import { OperationsView } from "./pages/OperationsView";
import { SystemSettings } from "./pages/SystemSettings";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/topology" element={<TopologyView />} />
          <Route path="/operations" element={<OperationsView />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
