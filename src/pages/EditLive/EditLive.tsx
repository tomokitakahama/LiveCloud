import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  MapPin,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Artist, SetlistItem } from "../../types/artist";
import "./EditLive.css";

type EditLiveProps = {
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

type EditableSetlistItem = Exclude<SetlistItem, string>;

const toEditableSetlistItem = (item: SetlistItem): EditableSetlistItem =>
  typeof item === "string" ? { type: "song", title: item } : item;

/** Converts selected photos to strings suitable for the existing local storage model. */
const readPhoto = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

const EditLive = ({ artists, setArtists }: EditLiveProps) => {
  const navigate = useNavigate();
  const { artistId = "", liveId = "" } = useParams();
  const liveIndex = Number(liveId);
  const artist = artists.find(
    (item) => item.name.toLowerCase() === artistId.toLowerCase(),
  );
  const live = artist?.lives[liveIndex];

  const [title, setTitle] = useState(live?.title ?? "");
  const [date, setDate] = useState(live?.date ?? "");
  const [venue, setVenue] = useState(live?.venue ?? "");
  const [memo, setMemo] = useState(live?.memo ?? "");
  const [rating, setRating] = useState(live?.rating ?? 0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [setlist, setSetlist] = useState<EditableSetlistItem[]>(
    live?.setlist.map(toEditableSetlistItem) ?? [],
  );

  if (!artist || !live || Number.isNaN(liveIndex)) {
    return (
      <main className="editLivePage editLiveNotFound">
        <p>編集するライブが見つかりませんでした。</p>
        <button type="button" onClick={() => navigate(-1)}>
          戻る
        </button>
      </main>
    );
  }

  const addSetlistItem = (type: EditableSetlistItem["type"]) => {
    setSetlist((items) => [
      ...items,
      type === "song" ? { type, title: "" } : { type },
    ]);
  };

  const removeSetlistItem = (index: number) => {
    setSetlist((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateSong = (index: number, songTitle: string) => {
    setSetlist((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, title: songTitle } : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !date || !venue.trim()) {
      window.alert("ライブ名・日付・会場を入力してください。");
      return;
    }

    const photoData = await Promise.all(photos.map(readPhoto));

    setArtists((currentArtists) =>
      currentArtists.map((currentArtist) => {
        if (currentArtist.name !== artist.name) return currentArtist;

        return {
          ...currentArtist,
          lives: currentArtist.lives.map((currentLive, index) =>
            index === liveIndex
              ? {
                  ...currentLive,
                  title: title.trim(),
                  date,
                  venue: venue.trim(),
                  memo,
                  rating,
                  setlist,
                  photos: photoData.length ? photoData : currentLive.photos,
                }
              : currentLive,
          ),
        };
      }),
    );

    navigate(`/live/${artistId}/${liveId}`, { replace: true });
  };

  return (
    <main className="editLivePage">
      <header className="editLiveHeader">
        <button type="button" onClick={() => navigate(-1)} aria-label="戻る">
          <ArrowLeft size={23} />
        </button>
        <div>
          <p>LIVE RECORD</p>
          <h1>ライブを編集</h1>
        </div>
        <span aria-hidden="true" />
      </header>

      <form
        className="editLiveForm"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <section className="editSection">
          <h2>基本情報</h2>
          <label>
            ライブ名
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="editTwoColumns">
            <label>
              <span className="labelWithIcon">
                <CalendarDays size={14} /> 日付
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label>
              <span className="labelWithIcon">
                <MapPin size={14} /> 会場
              </span>
              <input
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="editSection ratingSection">
          <h2>評価</h2>
          <div className="editStars" aria-label={`評価 ${rating} / 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <button
                type="button"
                key={index}
                className={index < rating ? "selected" : ""}
                onClick={() => setRating(index + 1)}
                aria-label={`${index + 1}点`}
              >
                <Star size={29} fill="currentColor" />
              </button>
            ))}
            <span>{rating ? `${rating}.0` : "未評価"}</span>
          </div>
        </section>

        <section className="editSection">
          <h2>
            セットリスト <small>任意</small>
          </h2>
          <div className="editSetlistActions">
            <button type="button" onClick={() => addSetlistItem("song")}>
              <Plus size={15} /> 曲を追加
            </button>
            <button type="button" onClick={() => addSetlistItem("mc")}>
              MC
            </button>
            <button type="button" onClick={() => addSetlistItem("encore")}>
              ENCORE
            </button>
          </div>
          <div className="editSetlistRows">
            {setlist.map((item, index) =>
              item.type === "song" ? (
                <div className="editSongRow" key={index}>
                  <b>
                    {
                      setlist
                        .slice(0, index + 1)
                        .filter((value) => value.type === "song").length
                    }
                  </b>
                  <input
                    value={item.title ?? ""}
                    onChange={(event) => updateSong(index, event.target.value)}
                    placeholder="曲名を入力"
                  />
                  <button
                    type="button"
                    onClick={() => removeSetlistItem(index)}
                    aria-label="曲を削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="editSetlistMarker" key={index}>
                  <span>{item.type === "mc" ? "MC" : "ENCORE"}</span>
                  <button
                    type="button"
                    onClick={() => removeSetlistItem(index)}
                    aria-label={`${item.type}を削除`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="editSection">
          <h2>
            感想メモ <small>任意</small>
          </h2>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="ライブの感想を残しましょう"
          />
        </section>

        <section className="editSection">
          <h2>
            写真 <small>任意</small>
          </h2>
          <label className="editPhotoUpload">
            <ImagePlus size={24} />
            <span>写真を追加・差し替え</span>
            <small>現在 {live.photos.length} 枚</small>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                setPhotos(
                  event.target.files ? Array.from(event.target.files) : [],
                )
              }
            />
          </label>
          {photos.length > 0 && (
            <p className="selectedPhotos">
              新しく選択した写真：{photos.length}枚
            </p>
          )}
        </section>

        <button className="editLiveSubmit" type="submit">
          変更を保存
        </button>
      </form>
    </main>
  );
};

export default EditLive;
