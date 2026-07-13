import type { Artist } from "./types/artist";
import Stats from "./pages/Stats/Stats";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import ArtistDetail from "./pages/ArtistDetail/ArtistDetail";
import AddArtist from "./pages/AddArtist/AddArtist";
import LiveDetail from "./pages/LiveDetail/LiveDetail";
import EditLive from "./pages/EditLive/EditLive";
import AddLiveBasic from "./pages/AddLiveBasic/AddLiveBasic";

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

      lives: [
        {
  title: "YOASOBI DOME LIVE 2026",
  date: "2026/05/01",
  venue: "東京ドーム",

  liveType: "ワンマン",

  openTime: "18:00",

  startTime: "19:00",

  seat: "",

  rating: 5,

  memo: "",

  setlist: [],

  photos: [],
},
        {
  title: "YOASOBI ARENA TOUR 2025",
  date: "2025/12/10",
  venue: "有明アリーナ",
  rating: 4,
  photos: [],
},
      ],
    },
{
  name: "Vaundy",
  liveCount: 5,
  lastLiveDate: "2025/12/15",
  image: vaundy,

  lives: [],
},
  {
  name: "ヨルシカ",
  liveCount: 8,
  lastLiveDate: "2025/11/20",
  image: yorushika,

  lives: [],
},
  {
  name: "CLAN QUEEN",
  liveCount: 3,
  lastLiveDate: "2025/08/10",
  image: clanqueen,

  lives: [],
},
];

const [artists, setArtists] =
  useState<Artist[]>(() => {

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
  element={
    <ArtistDetail
      artists={artists}
      setArtists={setArtists}
    />
  }
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

        <Route
  path="/stats"
  element={
    <Stats
      artists={artists}
    />
  }
/>

<Route
  path="/live/:artistId/:liveId"
  element={
    <LiveDetail
  artists={artists}
  setArtists={setArtists}
/>
  }
/>

<Route
  path="/artist/:artistId/live/:liveId/edit"
  element={
    <EditLive
      artists={artists}
      setArtists={setArtists}
    />
  }
/>

<Route
  path="/artist/:artistId/add-live"
  element={
    <AddLiveBasic
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