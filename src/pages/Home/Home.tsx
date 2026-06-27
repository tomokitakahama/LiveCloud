import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import ArtistCard from "../../components/ArtistCard/ArtistCard";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import FloatingButton from "../../components/FloatingButton/FloatingButton";

import yoasobi from "../../assets/images/yoasobi.jpg";
import vaundy from "../../assets/images/vaundy.jpg";
import yorushika from "../../assets/images/yorushika.jpg";
import clanqueen from "../../assets/images/clanqueen.jpg";

import "./Home.css";

type HomeProps = {
  artists: any[];
  setArtists: React.Dispatch<React.SetStateAction<any[]>>;
};

const Home = ({
  artists,
  setArtists,
}: HomeProps) => {

  return (
    <div className="container">
      <Header />

      <SearchBar />

      <div className="titleArea">
        <button
  onClick={() =>
    setArtists([
      ...artists,
      {
        name: "テストアーティスト",
        liveCount: 0,
        lastLiveDate: "未参戦",
        image: yoasobi,
      },
    ])
  }
>
  テスト追加
</button>
        <h2>My Artists</h2>
        <span>{artists.length}組</span>
      </div>

      {artists.map((artist) => (
        <ArtistCard
          key={artist.name}
          name={artist.name}
          liveCount={artist.liveCount}
          lastLiveDate={artist.lastLiveDate}
          image={artist.image}
        />
      ))}

      <FloatingButton />

      <BottomNavigation />
    </div>
  );
};

export default Home;