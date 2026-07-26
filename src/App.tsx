import type { Artist } from "./types/artist";
import Stats from "./pages/Stats/Stats";
import { useState, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ArtistDetail from "./pages/ArtistDetail/ArtistDetail";
import AddArtist from "./pages/AddArtist/AddArtist";
import LiveDetail from "./pages/LiveDetail/LiveDetail";
import EditLive from "./pages/EditLive/EditLive";
import AddLiveBasic from "./pages/AddLiveBasic/AddLiveBasic";
import AddLiveDetail from "./pages/AddLiveDetail/AddLiveDetail";
import Settings from "./pages/Settings/Settings";


function App() {
  const initialArtists: Artist[] = [];

  const [artists, setArtists] = useState<Artist[]>(() => {
    const savedArtists = localStorage.getItem("artists");

    return savedArtists ? JSON.parse(savedArtists) : initialArtists;
  });

  useEffect(() => {
    localStorage.setItem("artists", JSON.stringify(artists));
  }, [artists]);

  return (
    <HashRouter>
      <div className="appContainer">
        <Routes>
          <Route
            path="/"
            element={<Home artists={artists} setArtists={setArtists} />}
          />

          <Route
            path="/artist/:artistId"
            element={<ArtistDetail artists={artists} setArtists={setArtists} />}
          />

          <Route
            path="/add-artist"
            element={<AddArtist artists={artists} setArtists={setArtists} />}
          />

          <Route path="/stats" element={<Stats artists={artists} />} />

          <Route
            path="/live/:artistId/:liveId"
            element={<LiveDetail artists={artists} setArtists={setArtists} />}
          />

          <Route
            path="/artist/:artistId/live/:liveId/edit"
            element={<EditLive artists={artists} setArtists={setArtists} />}
          />

          <Route path="/artist/:artistId/add-live" element={<AddLiveBasic />} />

          <Route
            path="/artist/:artistId/add-live/detail"
            element={<AddLiveDetail setArtists={setArtists} />}
          />

          <Route
            path="/settings"
            element={<Settings artists={artists} setArtists={setArtists} />}
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
