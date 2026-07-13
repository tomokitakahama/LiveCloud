import "./EditLive.css";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

type EditLiveProps = {
  artists: any[];

  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const EditLive = ({
  artists,
  setArtists,
}: EditLiveProps) => {

  const navigate = useNavigate();

  const { artistId, liveId } =
    useParams();

  const artist = artists.find(
    (artist) =>
      artist.name.toLowerCase() ===
      artistId
  );

  const live =
    artist?.lives[Number(liveId)];

  const [title, setTitle] =
    useState(live?.title || "");

  const [date, setDate] =
    useState(live?.date || "");

  const [venue, setVenue] =
    useState(live?.venue || "");

  const [memo, setMemo] =
    useState(live?.memo || "");

  const [rating, setRating] =
    useState(live?.rating || 0);

    const [photos, setPhotos] =
  useState<File[]>([]);

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

const photoData = await Promise.all(
  photoPromises
);

  const updatedArtists =
    artists.map((item) => {

      if (
        item.name.toLowerCase() !== artistId
      ) {
        return item;
      }

      return {

        ...item,

        lives: item.lives.map(
          (liveItem, index) => {

            if (
              index !== Number(liveId)
            ) {
              return liveItem;
            }

            return {

              ...liveItem,

              title,

              date,

              venue,

              memo,

              rating,

              photos:
  photoData.length > 0
    ? photoData
    : liveItem.photos ?? [],

            };

          }
        ),

      };

    });

  setArtists(updatedArtists);

  alert("保存しました！");

  navigate(
    `/live/${artistId}/${liveId}`
  );

};

  return (

    <div className="editLiveContainer">

      <button
        className="backButton"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={24} />
      </button>

      <h1>ライブ編集</h1>

      <h3>ライブ名</h3>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <h3>開催日</h3>

      <input
        type="date"
        value={date}
        onChange={(e) =>
          setDate(e.target.value)
        }
      />

      <h3>会場</h3>

      <input
        value={venue}
        onChange={(e) =>
          setVenue(e.target.value)
        }
      />

      <h3>評価</h3>

      <div className="ratingArea">

        {Array.from({
          length: 5,
        }).map((_, index) => (

          <span
            key={index}
            onClick={() =>
              setRating(index + 1)
            }
            style={{
              cursor: "pointer",
            }}
          >

            {index < rating
              ? "⭐"
              : "☆"}

          </span>

        ))}

      </div>

      <h3>感想</h3>

      <textarea
        value={memo}
        onChange={(e) =>
          setMemo(e.target.value)
        }
      />

      <h3>ライブ写真</h3>

<input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => {

    if (!e.target.files) return;

    setPhotos(
      Array.from(e.target.files)
    );

  }}
/>

<p>

選択中：

{photos.length}枚

</p>

      <button
  className="saveButton"
  onClick={handleSave}
>

  保存

</button>

    </div>

  );
};

export default EditLive;