import "./ArtistDetail.css";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import type { Artist, Live } from "../../types/artist";

type ArtistDetailProps = {
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

const ArtistDetail = ({ artists, setArtists }: ArtistDetailProps) => {
  const { artistId = "" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"lives" | "profile">("lives");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const artist = artists.find(
    (item) => item.name.toLowerCase() === artistId.toLowerCase(),
  );

  if (!artist) {
    return (
      <main className="artistDetailPage artistNotFound">
        <p>アーティストが見つかりません</p>
        <button onClick={() => navigate("/")}>ホームへ戻る</button>
      </main>
    );
  }

  const lives: Live[] = artist.lives ?? [];
  const timelineLives = lives
    .map((live, index) => ({ live, index }))
    .sort((a, b) => {
      const aDate = new Date(a.live.date.replaceAll("/", "-")).getTime();
      const bDate = new Date(b.live.date.replaceAll("/", "-")).getTime();
      return bDate - aDate;
    });

  const deleteArtist = () => {
    if (!window.confirm(`${artist.name}をアーティスト一覧から削除しますか？`))
      return;
    setArtists((current) =>
      current.filter((item) => item.name !== artist.name),
    );
    navigate("/");
  };

  const deleteLive = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.stopPropagation();
    if (!window.confirm("このライブ記録を削除しますか？")) return;
    setArtists((current) =>
      current.map((item) =>
        item.name === artist.name
          ? {
              ...item,
              lives: item.lives.filter(
                (_: Live, liveIndex: number) => liveIndex !== index,
              ),
              liveCount: Math.max(0, item.liveCount - 1),
            }
          : item,
      ),
    );
  };

  return (
    <main className="artistDetailPage">
      <section
        className="artistHero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(28, 25, 70, .7), rgba(74, 51, 160, .38)), url(${artist.image})`,
        }}
      >
        <div className="artistHeroTop">
          <button
            className="iconButton"
            type="button"
            onClick={() => navigate("/")}
            aria-label="ホームへ戻る"
          >
            <ArrowLeft size={23} />
          </button>
          <div className="menuWrap">
            <button
              className="iconButton"
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="アーティストの操作"
            >
              <MoreHorizontal size={23} />
            </button>
            {isMenuOpen && (
              <button
                className="deleteArtist"
                type="button"
                onClick={deleteArtist}
              >
                <Trash2 size={15} /> アーティストを削除
              </button>
            )}
          </div>
        </div>
        <div className="artistHeroInfo">
          <img
            className="artistAvatar"
            src={artist.image}
            alt={`${artist.name}のアーティスト写真`}
          />
          <div>
            <h1>{artist.name}</h1>
            <p>
              ライブ参戦&nbsp; <strong>{artist.liveCount}回</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="artistContent">
        <div
          className="detailTabs"
          role="tablist"
          aria-label="アーティスト情報"
        >
          <button
            className={activeTab === "lives" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === "lives"}
            onClick={() => setActiveTab("lives")}
          >
            ライブ一覧
          </button>
          <button
            className={activeTab === "profile" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            基本情報
          </button>
        </div>

        {activeTab === "lives" ? (
          <div className="liveTimeline">
            {timelineLives.length > 0 ? (
              timelineLives.map(({ live, index }) => (
                <article
                  className="timelineItem"
                  key={`${live.title}-${index}`}
                  onClick={() => navigate(`/live/${artistId}/${index}`)}
                >
                  <span className="timelineRail" aria-hidden="true">
                    <i />
                  </span>
                  <div className="liveCopy">
                    <p className="liveDate">
                      <CalendarDays size={13} /> {live.date}
                    </p>
                    <h2>{live.title}</h2>
                    <p className="liveVenue">
                      <MapPin size={13} /> {live.venue || "会場未登録"}
                    </p>
                  </div>
                  <img
                    className="timelineLivePhoto"
                    src={live.photos?.[0] || artist.image}
                    alt=""
                  />
                  <ChevronRight
                    className="liveChevron"
                    size={18}
                    aria-hidden="true"
                  />
                  <button
                    className="deleteLive"
                    type="button"
                    onClick={(event) => deleteLive(event, index)}
                    aria-label={`${live.title}を削除`}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))
            ) : (
              <div className="noLives">
                <p>まだライブ記録がありません</p>
                <span>最初のライブを追加して、思い出を残しましょう。</span>
              </div>
            )}
          </div>
        ) : (
          <div className="profilePanel">
            <img src={artist.image} alt="" />
            <h2>{artist.name}</h2>
            <p>ライブ参戦回数</p>
            <strong>{artist.liveCount}回</strong>
            <p>最終参戦日</p>
            <strong>{artist.lastLiveDate}</strong>
          </div>
        )}
      </section>

      <button
        className="addLive"
        type="button"
        onClick={() => navigate(`/artist/${artistId}/add-live`)}
      >
        <Plus size={25} />
      </button>
      <BottomNavigation />
    </main>
  );
};

export default ArtistDetail;
