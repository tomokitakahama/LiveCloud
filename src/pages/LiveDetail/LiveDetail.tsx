import "./LiveDetail.css";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Artist, Live } from "../../types/artist";

type LiveDetailProps = {
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

const LiveDetail = ({ artists, setArtists }: LiveDetailProps) => {
  const { artistId = "", liveId = "" } = useParams();
  const navigate = useNavigate();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const liveIndex = Number(liveId);
  const artist = artists.find(
    (item) => item.name.toLowerCase() === artistId.toLowerCase(),
  );
  const live: Live | undefined = artist?.lives?.[liveIndex];
  const photos = live?.photos ?? [];
  const heroImage = photos[currentPhoto] || artist?.image;

  const updateRating = (rating: number) => {
    setArtists((current) =>
      current.map((item) =>
        item.name.toLowerCase() !== artistId.toLowerCase()
          ? item
          : {
              ...item,
              lives: item.lives.map((liveItem: Live, index: number) =>
                index === liveIndex ? { ...liveItem, rating } : liveItem,
              ),
            },
      ),
    );
  };

  if (!live || !artist) {
    return (
      <main className="liveDetailPage liveNotFound">
        <p>ライブ記録が見つかりません</p>
        <button onClick={() => navigate(-1)}>戻る</button>
      </main>
    );
  }

  const setlist = live.setlist ?? [];
  const songNumber = (index: number) =>
    setlist
      .slice(0, index + 1)
      .filter((item) => typeof item === "string" || item.type === "song")
      .length;

  /** Removes only the live currently being viewed after explicit confirmation. */
  const deleteLive = () => {
    if (!window.confirm(`「${live.title}」を削除しますか？`)) return;

    setArtists((currentArtists) =>
      currentArtists.map((currentArtist) =>
        currentArtist.name !== artist.name
          ? currentArtist
          : {
              ...currentArtist,
              liveCount: Math.max(0, currentArtist.liveCount - 1),
              lives: currentArtist.lives.filter(
                (_, index) => index !== liveIndex,
              ),
            },
      ),
    );

    navigate(`/artist/${artistId}`, { replace: true });
  };

  return (
    <main className="liveDetailPage">
      <section
        className="liveHero"
        style={
          heroImage
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(22, 16, 53, .15), rgba(22, 16, 53, .42)), url(${heroImage})`,
              }
            : undefined
        }
      >
        <div className="liveHeroActions">
          <button
            type="button"
            onClick={() => navigate(`/artist/${artistId}`)}
            aria-label="アーティスト詳細へ戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="liveMoreMenu">
            <button
              type="button"
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              aria-label="その他の操作"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal size={23} />
            </button>
            {isMenuOpen && (
              <button
                type="button"
                className="deleteLiveMenuItem"
                onClick={deleteLive}
              >
                <Trash2 size={16} />
                ライブを削除
              </button>
            )}
          </div>
        </div>
        {!heroImage && <span className="noHeroImage">No Image</span>}
        {photos.length > 1 && (
          <div className="heroPager">
            {photos.map((_, index) => (
              <button
                key={index}
                className={index === currentPhoto ? "current" : ""}
                onClick={() => setCurrentPhoto(index)}
                aria-label={`${index + 1}枚目を表示`}
              />
            ))}
          </div>
        )}
      </section>

      <article className="liveDetailCard">
        <h1>{live.title}</h1>
        <div className="eventMeta">
          <p>
            <CalendarDays size={15} /> {live.date}
          </p>
          <p>
            <MapPin size={15} /> {live.venue || "会場未登録"}
          </p>
        </div>

        <section className="detailSection ratingSection">
          <h2>評価</h2>
          <div className="stars" aria-label={`評価 ${live.rating ?? 0} / 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <button
                type="button"
                key={index}
                className={index < (live.rating ?? 0) ? "filled" : ""}
                onClick={() => updateRating(index + 1)}
                aria-label={`${index + 1}点`}
              >
                <Star size={25} fill="currentColor" />
              </button>
            ))}
            <span>{live.rating ? live.rating.toFixed(1) : "未評価"}</span>
          </div>
        </section>

        <section className="detailSection setlistSection">
          <h2>セットリスト</h2>
          {setlist.length ? (
            <ol className="setlistList">
              {setlist.map((item, index) => {
                if (typeof item !== "string" && item.type === "mc")
                  return (
                    <li className="setlistDivider" key={index}>
                      <span>MC</span>
                    </li>
                  );
                if (typeof item !== "string" && item.type === "encore")
                  return (
                    <li className="setlistDivider encore" key={index}>
                      <span>ENCORE</span>
                    </li>
                  );
                return (
                  <li key={index}>
                    <b>{songNumber(index)}</b>
                    <span>
                      {typeof item === "string"
                        ? item
                        : item.title || "曲名未登録"}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="emptyDetail">セットリストはありません</p>
          )}
        </section>

        <section className="detailSection liveInformationSection">
          <h2>ライブ詳細情報</h2>
          <dl className="liveInformationList">
            <div>
              <dt>ライブ種別</dt>
              <dd>{live.liveType || "未登録"}</dd>
            </div>
            <div>
              <dt>開場</dt>
              <dd>{live.openTime || "未登録"}</dd>
            </div>
            <div>
              <dt>開演</dt>
              <dd>{live.startTime || "未登録"}</dd>
            </div>
            <div>
              <dt>座席</dt>
              <dd>{live.seat || "未登録"}</dd>
            </div>
          </dl>
        </section>

        <section className="detailSection">
          <h2>写真</h2>
          {photos.length ? (
            <div className="livePhotoGrid">
              {photos.slice(0, 3).map((photo, index) => (
                <button
                  type="button"
                  key={photo}
                  onClick={() => setCurrentPhoto(index)}
                >
                  <img src={photo} alt={`${live.title}の写真 ${index + 1}`} />
                  {index === 2 && photos.length > 3 && (
                    <span>+{photos.length - 3}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="emptyDetail">写真はありません</p>
          )}
        </section>

        <section className="detailSection memoSection">
          <h2>感想メモ</h2>
          <p>{live.memo || "感想メモはありません"}</p>
        </section>
      </article>

      <button
        type="button"
        className="editLiveFab"
        onClick={() => navigate(`/artist/${artistId}/live/${liveId}/edit`)}
        aria-label="ライブ記録を編集"
      >
        <Pencil size={22} />
      </button>
    </main>
  );
};

export default LiveDetail;
