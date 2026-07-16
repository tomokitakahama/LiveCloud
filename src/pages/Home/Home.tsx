import { useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import ArtistCard from "../../components/ArtistCard/ArtistCard";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import FloatingButton from "../../components/FloatingButton/FloatingButton";
import "./Home.css";

type HomeProps = {
  artists: any[];
  setArtists: React.Dispatch<React.SetStateAction<any[]>>;
};

const Home = ({ artists }: HomeProps) => {
  const [searchText, setSearchText] = useState("");

  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        artist.name.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [artists, searchText],
  );

  return (
    <main className="home">
      <Header />

      <SearchBar value={searchText} onChange={setSearchText} />

      <section className="artistSection" aria-labelledby="artist-list-title">
        <div className="artistSectionHeader">
          <div className="artistTitle">
            <h2 id="artist-list-title">My Artists</h2>
            <span>{artists.length}組</span>
          </div>
          <span className="sortLabel">最終参戦日順</span>
        </div>

        <div className="artistList">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.name}
              name={artist.name}
              liveCount={artist.liveCount}
              lastLiveDate={artist.lastLiveDate}
              image={artist.image}
            />
          ))}
          {filteredArtists.length === 0 && (
            <p className="emptyState">該当するアーティストが見つかりません</p>
          )}
        </div>
      </section>

      <FloatingButton />
      <BottomNavigation />
    </main>
  );
};

export default Home;
