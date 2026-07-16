import "./AddLiveDetail.css";

import { useState } from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

type AddLiveDetailProps = {
  artists: any[];

  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const AddLiveDetail = ({
  artists,
  setArtists,
}: AddLiveDetailProps) => {

  const navigate = useNavigate();

  const { artistId } = useParams();

  const { state } = useLocation();

  const {
  title,
  liveType,
  date,
  venue,
  openTime,
  startTime,
  seat,
} = state;

  const [rating, setRating] =
    useState(0);

  const [memo, setMemo] =
    useState("");

  type SetlistItem = {
  type: "song" | "mc" | "encore";
  title?: string;
};

const [setlist, setSetlist] =
  useState<SetlistItem[]>([]);

  const addSong = () => {

  setSetlist([
    ...setlist,
    {
      type: "song",
      title: "",
    },
  ]);

};

const addMC = () => {

  setSetlist([
    ...setlist,
    {
      type: "mc",
    },
  ]);

};

const addEncore = () => {

  setSetlist([
    ...setlist,
    {
      type: "encore",
    },
  ]);

};

    const handleSetlistChange = (
  index: number,
  value: string
) => {

  const updated = [...setlist];

  updated[index].title = value;

  setSetlist(updated);

};

const handleDeleteItem = (
  index: number
) => {

  setSetlist(
    setlist.filter(
      (_, i) => i !== index
    )
  );

};

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

  const photoData = await Promise.all(photoPromises);

  const updatedArtists = artists.map((item) => {

    if (item.name.toLowerCase() !== artistId) {
      return item;
    }

    return {

      ...item,

      liveCount: item.liveCount + 1,

      lastLiveDate: date,

      lives: [

        ...item.lives,

        {
          title,
          liveType,
          date,
          venue,
          openTime,
          startTime,
          seat,

          rating,

          memo,

          setlist,

          photos: photoData,
        },

      ],

    };

  });

  setArtists(updatedArtists);

  navigate(
  `/artist/${artistId}`,
  { replace: true }
);

};

  return (

    <div className="addLiveDetailContainer">

      <h1>ライブ詳細</h1>

      <h3>評価</h3>

<div className="ratingArea">

  {Array.from({ length: 5 }).map((_, index) => (

    <span
      key={index}
      onClick={() =>
        setRating(index + 1)
      }
      style={{
        cursor: "pointer",
        fontSize: "32px",
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
  rows={8}
  value={memo}
  onChange={(e) =>
    setMemo(e.target.value)
  }
  placeholder="ライブの感想を書こう"
/>

<h3>セットリスト</h3>

<div className="setlistButtons">

  <button onClick={addSong}>
    ＋ 曲追加
  </button>

  <button onClick={addMC}>
    MC
  </button>

  <button onClick={addEncore}>
    EN
  </button>

</div>

{setlist.map((item, index) => (

  <div key={index}>

    {item.type === "song" && (

      <div className="songRow">

        <span className="songNumber">
          {
            setlist
              .slice(0, index + 1)
              .filter(
                (i) => i.type === "song"
              ).length
          }
        </span>

        <input
          type="text"
          placeholder="曲名"
          value={item.title ?? ""}
          onChange={(e) =>
            handleSetlistChange(
              index,
              e.target.value
            )
          }
        />

        <button
          className="deleteSongButton"
          onClick={() =>
  handleDeleteItem(index)
}
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
      onClick={() =>
        handleDeleteItem(index)
      }
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
      onClick={() =>
        handleDeleteItem(index)
      }
    >
      ×
    </button>

  </div>

)}

  </div>

))}

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
  ライブを追加
</button>
</div>

  );

};

export default AddLiveDetail;