import "./AddLiveBasic.css";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

type AddLiveBasicProps = {
  artists: any[];
  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const AddLiveBasic = ({
  artists,
  setArtists,
}: AddLiveBasicProps) => {

  const navigate = useNavigate();

  const { artistId } = useParams();

  const artist = artists.find(
  (artist) =>
    artist.name.toLowerCase() === artistId
);

  const [title, setTitle] =
    useState("");

  const [liveType, setLiveType] =
    useState("ワンマン");

  const [date, setDate] =
    useState("");

  const [venue, setVenue] =
    useState("");

  const [openTime, setOpenTime] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [seat, setSeat] =
    useState("");

    const handleSave = () => {

  const updatedArtists = artists.map(
    (item) => {

      if (
        item.name.toLowerCase() !== artistId
      ) {
        return item;
      }

      return {

        ...item,

        liveCount:
          item.liveCount + 1,

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

            rating: 0,

            memo: "",

            setlist: [],

            photos: [],

          },

        ],

      };

    }
  );

  setArtists(updatedArtists);

const newLiveIndex =
  artist?.lives.length ?? 0;

navigate(
  `/live/${artistId}/${newLiveIndex}`
);

};

  return (

    <div className="addLiveContainer">

      <button
        className="backButton"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={24} />
      </button>

      <h1>ライブ追加</h1>

      <h3>ライブ名</h3>

<input
  value={title}
  onChange={(e) =>
    setTitle(e.target.value)
  }
/>

<h3>ライブ種別</h3>

<select
  value={liveType}
  onChange={(e) =>
    setLiveType(e.target.value)
  }
>
  <option>ワンマン</option>
  <option>フェス</option>
  <option>対バン</option>
  <option>イベント</option>
</select>

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

<h3>開場時間</h3>

<input
  type="time"
  value={openTime}
  onChange={(e) =>
    setOpenTime(e.target.value)
  }
/>

<h3>開演時間</h3>

<input
  type="time"
  value={startTime}
  onChange={(e) =>
    setStartTime(e.target.value)
  }
/>

<h3>座席</h3>

<input
  value={seat}
  onChange={(e) =>
    setSeat(e.target.value)
  }
/>

<button
  className="saveButton"
  onClick={handleSave}
>
  ライブを登録
</button>

    </div>

  );

};

export default AddLiveBasic;