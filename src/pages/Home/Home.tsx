import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import ArtistCard from "../../components/ArtistCard/ArtistCard";
import FloatingButton from "../../components/FloatingButton/FloatingButton";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const Home = () => {
  return (
    <>
      <Header />
      <SearchBar />

      <main style={{ padding: "20px" }}>
        <ArtistCard
          name="YOASOBI"
          liveCount={12}
          lastLiveDate="2026/05/01"
        />

        <br />

        <ArtistCard
          name="Vaundy"
          liveCount={5}
          lastLiveDate="2025/12/15"
        />
      </main>

       <FloatingButton />

      <BottomNavigation />
    </>
  );
};

export default Home;