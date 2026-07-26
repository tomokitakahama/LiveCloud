import "./EditLive.css";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Artist, SetlistItem } from "../../types/artist";

type EditLiveProps = {
  artists: Artist[];

  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

type EditableSetlistItem = Exclude<SetlistItem, string>;

const EditLive = ({ artists, setArtists }: EditLiveProps) => {
  const navigate = useNavigate();

  const { artistId, liveId } = useParams();

  const artist = artists.find(
    (artist) => artist.name.toLowerCase() === artistId,
  );

  const live = artist?.lives[Number(liveId)];

  const [title, setTitle] = useState(live?.title || "");

  const [date, setDate] = useState(live?.date || "");

  const [venue, setVenue] = useState(live?.venue || "");

  const [memo, setMemo] = useState(live?.memo || "");

  const [rating, setRating] = useState(live?.rating || 0);

  const [photos, setPhotos] = useState<File[]>([]);

  const [setlist, setSetlist] = useState<EditableSetlistItem[]>(
    live?.setlist?.filter(
      (item): item is EditableSetlistItem => typeof item !== "string",
    ) ?? [],
  );

  const handleSetlistChange = (index: number, value: string) => {
    const updated = [...setlist];

    updated[index].title = value;

    setSetlist(updated);
  };

  const handleAddSong = () => {
    setSetlist([
      ...setlist,
      {
        type: "song",
        title: "",
      },
    ]);
  };

  const handleAddMC = () => {
    setSetlist([
      ...setlist,
      {
        type: "mc",
      },
    ]);
  };

  const handleAddEncore = () => {
    setSetlist([
      ...setlist,
      {
        type: "encore",
      },
    ]);
  };

  const handleDeleteSong = (index: number) => {
    setSetlist(setlist.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const photoPromises = photos.map((photo) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result as string);
        };

        reader.readAsDataURL(photo);
      });
    });

    const photoData = await Promise.all(photoPromises);

    const updatedArtists = artists.map((item) => {
      if (item.name.toLowerCase() !== artistId) {
        return item;
      }

      return {
        ...item,

        lives: item.lives.map((liveItem, index) => {
          if (index !== Number(liveId)) {
            return liveItem;
          }

          return {
            ...liveItem,

            title,

            date,

            venue,

            memo,

            rating,

            setlist,

            photos: photoData.length > 0 ? photoData : (liveItem.photos ?? []),
          };
        }),
      };
    });

    setArtists(updatedArtists);

    alert("保存しました！");

    navigate(`/live/${artistId}/${liveId}`, { replace: true });
  };

  return (
    <div className="editLiveContainer">
      <button className="backButton" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      <h1>ライブ編集</h1>

      <h3>ライブ名</h3>

      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <h3>開催日</h3>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <h3>会場</h3>

      <input value={venue} onChange={(e) => setVenue(e.target.value)} />

      <h3>評価</h3>

      <div className="ratingArea">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <span
            key={index}
            onClick={() => setRating(index + 1)}
            style={{
              cursor: "pointer",
            }}
          >
            {index < rating ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      <h3>セットリスト</h3>

      <div className="setlistButtons">
        <button onClick={handleAddSong}>＋ 曲追加</button>

        <button onClick={handleAddMC}>MC</button>

        <button onClick={handleAddEncore}>EN</button>
      </div>

      <div className="setlistArea">
        {setlist.map((item, index) => (
          <div key={index}>
            {item.type === "song" && (
              <div className="songRow">
                <span className="songNumber">
                  {
                    setlist.slice(0, index + 1).filter((i) => i.type === "song")
                      .length
                  }
                </span>

                <input
                  type="text"
                  placeholder="曲名"
                  value={item.title ?? ""}
                  onChange={(e) => handleSetlistChange(index, e.target.value)}
                />

                <button
                  className="deleteSongButton"
                  onClick={() => handleDeleteSong(index)}
                >
                  ×
                </button>
              </div>
            )}

            {item.type === "mc" && (
              <div className="mcRow">
                <span>───── MC ─────</span>

                <button
                  className="deleteSongButton"
                  onClick={() => handleDeleteSong(index)}
                >
                  ×
                </button>
              </div>
            )}

            {item.type === "encore" && (
              <div className="encoreRow">
                <span>──── ENCORE ────</span>

                <button
                  className="deleteSongButton"
                  onClick={() => handleDeleteSong(index)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />

      <h3>ライブ写真</h3>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (!e.target.files) return;

          setPhotos(Array.from(e.target.files));
        }}
      />

      <p>
        選択中：
        {photos.length}枚
      </p>

      <button className="saveButton" onClick={handleSave}>
        保存
      </button>
    </div>
  );
};

export default EditLive;
