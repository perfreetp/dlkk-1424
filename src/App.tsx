import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ModelSelect from "@/pages/ModelSelect";
import ScreenOptions from "@/pages/ScreenOptions";
import Compatibility from "@/pages/Compatibility";
import Inventory from "@/pages/Inventory";
import CompareList from "@/pages/CompareList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/model-select" replace />} />
        <Route path="/model-select" element={<ModelSelect />} />
        <Route path="/screen-options" element={<ScreenOptions />} />
        <Route path="/compatibility" element={<Compatibility />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/compare" element={<CompareList />} />
        <Route path="*" element={<Navigate to="/model-select" replace />} />
      </Routes>
    </Router>
  );
}
