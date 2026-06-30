import { useState } from "react";
import "./LiveDetail.css";
import { ArrowLeft } from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

type LiveDetailProps = {
  artists: any[];

  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const LiveDetail = ({
  artists,
  setArtists,
}: LiveDetailProps) => {

    const { artistId, liveId } = useParams();

  const navigate = useNavigate();

  const artist = artists.find(
  (artist) =>
    artist.name.toLowerCase() === artistId
);

const live =
  artist?.lives[Number(liveId)];

  const [memo, setMemo] =
  useState(live?.memo || "");

  const [title, setTitle] =
  useState(live?.title || "");

const [date, setDate] =
  useState(live?.date || "");

const [venue, setVenue] =
  useState(live?.venue || "");

  const handleRating = (
  rating: number
) => {

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
              rating,
            };
          }
        ),
      };
    });

  setArtists(updatedArtists);
};

const handleSaveMemo = () => {

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

  rating: live?.rating ?? 0,
};
          }
        ),

      };
    });

  setArtists(updatedArtists);

  alert("保存しました！");
};

  return (

    <div className="liveDetailContainer">

      <button
        className="backButton"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={24} />
      </button>

      <h1>ライブ詳細</h1>

      <div className="liveCard">

        <h3>ライブ名</h3>

<input
  type="text"
  value={title}
  onChange={(e) =>
    setTitle(e.target.value)
  }
/>

<div className="ratingArea">

  {Array.from({ length: 5 }).map((_, index) => (

    <span
      key={index}
      onClick={() =>
        handleRating(index + 1)
      }
      style={{
        cursor: "pointer",
      }}
    >
      {index < (live?.rating ?? 0)
        ? "⭐"
        : "☆"}
    </span>

  ))}

</div>

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
  type="text"
  value={venue}
  onChange={(e) =>
    setVenue(e.target.value)
  }
/>

<h3>感想メモ</h3>

<textarea
  value={memo}
  onChange={(e) =>
    setMemo(e.target.value)
  }
  placeholder="ライブの感想を書こう"
/>

<button
  className="saveMemoButton"
  onClick={handleSaveMemo}
>
  メモを保存
</button>

      </div>

    </div>

  );
};

export default LiveDetail;