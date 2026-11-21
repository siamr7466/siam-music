import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Home from "./pages/Home";
import Artists from "./pages/Artists";
import Playlists from "./pages/Playlists";
import Offline from "./pages/Offline";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import "./App.css";

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="app">
          <Sidebar />
          <main className="app__main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/search" element={<Search />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
          </main>
        </div>
        <Player />
      </BrowserRouter>
    </PlayerProvider>
  );
}
