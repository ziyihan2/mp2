import { Routes, Route } from "react-router-dom";
import ListView from "./page/ListView";
import GalleryView from "./page/GalleryView";
import DetailView from "./page/DetailView";


function App() {
  return (
    <Routes>
      <Route path="/" element={<ListView />} />
      <Route path="/gallery" element={<GalleryView />} />
      <Route path="/pokemon/:id" element={<DetailView />} />
    </Routes>

  );
}

export default App;