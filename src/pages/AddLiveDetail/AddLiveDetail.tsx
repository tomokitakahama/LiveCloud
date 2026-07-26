import "./AddLiveDetail.css";
import { ArrowLeft, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Artist } from "../../types/artist";

type SetlistItem = { type: "song" | "mc" | "encore"; title?: string };
type BasicData = {
  title: string;
  liveType: string;
  date: string;
  venue: string;
  openTime: string;
  startTime: string;
  seat: string;
};

type AddLiveDetailProps = {
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

const AddLiveDetail = ({ setArtists }: AddLiveDetailProps) => {
  const navigate = useNavigate();
  const { artistId = "" } = useParams();
  const { state } = useLocation();
  const basic = state as BasicData | null;
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState("");
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  if (!basic)
    return (
      <main className="addLiveDetailPage invalidAddLive">
        <p>基本情報がありません</p>
        <button onClick={() => navigate(`/artist/${artistId}/add-live`)}>
          入力画面へ戻る
        </button>
      </main>
    );
  const addSetlistItem = (type: SetlistItem["type"]) =>
    setSetlist((items) => [
      ...items,
      { type, title: type === "song" ? "" : undefined },
    ]);
  const updateSong = (index: number, title: string) =>
    setSetlist((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, title } : item,
      ),
    );
  const photoChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPhotos(event.target.files ? Array.from(event.target.files) : []);
  const handleSave = async () => {
    const photoData = await Promise.all(
      photos.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    );
    setArtists((current) =>
      current.map((artist) =>
        artist.name.toLowerCase() !== artistId.toLowerCase()
          ? artist
          : {
              ...artist,
              liveCount: artist.liveCount + 1,
              lastLiveDate: basic.date,
              lives: [
                ...artist.lives,
                { ...basic, rating, memo, setlist, photos: photoData },
              ],
            },
      ),
    );
    navigate(`/artist/${artistId}`, { replace: true });
  };
  return (
    <main className="addLiveDetailPage">
      <header className="addLiveDetailHeader">
        <button type="button" onClick={() => navigate(-1)} aria-label="戻る">
          <ArrowLeft size={23} />
        </button>
        <div>
          <p>STEP 2 / 2</p>
          <h1>ライブを追加</h1>
        </div>
        <span />
      </header>
      <div className="detailProgress">
        <i />
      </div>
      <section className="addLiveDetailForm">
        <section>
          <h2>評価</h2>
          <div className="addStars">
            {Array.from({ length: 5 }, (_, index) => (
              <button
                type="button"
                key={index}
                className={index < rating ? "selected" : ""}
                onClick={() => setRating(index + 1)}
                aria-label={`${index + 1}点`}
              >
                <Star size={28} fill="currentColor" />
              </button>
            ))}
            <span>{rating ? `${rating}.0` : "未評価"}</span>
          </div>
        </section>
        <section>
          <h2>
            セットリスト <small>（任意）</small>
          </h2>
          <div className="setlistActions">
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
          <div className="addSetlistRows">
            {setlist.map((item, index) =>
              item.type === "song" ? (
                <div className="songInputRow" key={index}>
                  <b>
                    {
                      setlist
                        .slice(0, index + 1)
                        .filter((value) => value.type === "song").length
                    }
                  </b>
                  <input
                    value={item.title || ""}
                    onChange={(event) => updateSong(index, event.target.value)}
                    placeholder="曲名を入力"
                  />
                  <button
                    onClick={() =>
                      setSetlist((items) =>
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="setlistMarker" key={index}>
                  <span>{item.type === "mc" ? "MC" : "ENCORE"}</span>
                  <button
                    onClick={() =>
                      setSetlist((items) =>
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            )}
          </div>
        </section>
        <section>
          <h2>
            写真 <small>（任意）</small>
          </h2>
          <label className="photoUpload">
            <ImagePlus size={24} />
            <span>写真を選択</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={photoChange}
            />
          </label>
          {photos.length > 0 && (
            <p className="selectedPhotos">{photos.length}枚の写真を選択中</p>
          )}
        </section>
        <section>
          <h2>
            感想メモ <small>（任意）</small>
          </h2>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="ライブの感想を残そう"
          />
        </section>
        <button className="addLiveSubmit" type="button" onClick={handleSave}>
          ライブを追加
        </button>
      </section>
    </main>
  );
};
export default AddLiveDetail;
