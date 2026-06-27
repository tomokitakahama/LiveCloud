import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import ArtistCard from "../../components/ArtistCard/ArtistCard";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import FloatingButton from "../../components/FloatingButton/FloatingButton";

import "./Home.css";

import yoasobi from "../../assets/images/yoasobi.jpg";
import vaundy from "../../assets/images/vaundy.jpg";
import yorushika from "../../assets/images/yorushika.jpg";
import clanqueen from "../../assets/images/clanqueen.jpg";

const Home = () => {
  return (
    <div className="container">
      <Header />

      <SearchBar />

      <div className="titleArea">
        <h2>My Artists</h2>
        <span>12組</span>
      </div>

      <ArtistCard
        name="YOASOBI"
        liveCount={12}
        lastLiveDate="2026/05/01"
        image={yoasobi}
      />

      <ArtistCard
        name="Vaundy"
        liveCount={5}
        lastLiveDate="2025/12/15"
        image={vaundy}
      />

      <ArtistCard
        name="ヨルシカ"
        liveCount={8}
        lastLiveDate="2025/11/20"
        image={yorushika}
      />

      <ArtistCard
        name="CLAN QUEEN"
        liveCount={3}
        lastLiveDate="2025/08/10"
        image={clanqueen}
      />

      <FloatingButton />

      <BottomNavigation />
    </div>
  );
};

export default Home;