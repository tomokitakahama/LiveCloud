import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import ArtistDetail from "./pages/ArtistDetail/ArtistDetail";
import AddArtist from "./pages/AddArtist/AddArtist";

import yoasobi from "./assets/images/yoasobi.jpg";
import vaundy from "./assets/images/vaundy.jpg";
import yorushika from "./assets/images/yorushika.jpg";
import clanqueen from "./assets/images/clanqueen.jpg";

function App() {

  const initialArtists = [
  {
    name: "YOASOBI",
    liveCount: 12,
    lastLiveDate: "2026/05/01",
    image: yoasobi,
  },
  {
    name: "Vaundy",
    liveCount: 5,
    lastLiveDate: "2025/12/15",
    image: vaundy,
  },
  {
    name: "ヨルシカ",
    liveCount: 8,
    lastLiveDate: "2025/11/20",
    image: yorushika,
  },
  {
    name: "CLAN QUEEN",
    liveCount: 3,
    lastLiveDate: "2025/08/10",
    image: clanqueen,
  },
];

const [artists, setArtists] = useState(() => {

  const savedArtists =
    localStorage.getItem("artists");

  return savedArtists
    ? JSON.parse(savedArtists)
    : initialArtists;
});

useEffect(() => {
  localStorage.setItem(
    "artists",
    JSON.stringify(artists)
  );
}, [artists]);

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <Home
              artists={artists}
              setArtists={setArtists}
            />
          }
        />

        <Route
          path="/artist/:artistId"
          element={<ArtistDetail />}
        />

        <Route
          path="/add-artist"
          element={
            <AddArtist
              artists={artists}
              setArtists={setArtists}
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;