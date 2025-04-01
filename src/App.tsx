import "@xyflow/react/dist/style.css";
import { HashRouter, Route, Routes } from 'react-router-dom';
import { EditRoute } from "./routes/edit-route";
import { ViewRoute } from "./routes/view-route";

function App() {
  return (
    <HashRouter >
      <Routes>
        <Route path="/" element={<EditRoute/>} />
        <Route path="/view" element={<ViewRoute/>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
