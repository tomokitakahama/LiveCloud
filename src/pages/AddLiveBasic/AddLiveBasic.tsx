import "./AddLiveBasic.css";
import { ArrowLeft, CalendarDays, MapPin, Ticket } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddLiveBasic = () => {
  const navigate = useNavigate();
  const { artistId = "" } = useParams();
  const [title, setTitle] = useState("");
  const [liveType, setLiveType] = useState("ワンマン");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [seat, setSeat] = useState("");

  const handleNext = () => {
    if (!title.trim() || !date || !venue.trim()) {
      alert("ライブ名・開催日・会場を入力してください");
      return;
    }
    navigate(`/artist/${artistId}/add-live/detail`, {
      state: {
        title: title.trim(),
        liveType,
        date,
        venue: venue.trim(),
        openTime,
        startTime,
        seat: seat.trim(),
      },
    });
  };

  return (
    <main className="addLivePage">
      <header className="addLiveHeader">
        <button type="button" onClick={() => navigate(-1)} aria-label="戻る">
          <ArrowLeft size={23} />
        </button>
        <div>
          <p>STEP 1 / 2</p>
          <h1>ライブを追加</h1>
        </div>
        <span />
      </header>
      <div className="addLiveProgress">
        <i />
      </div>
      <section className="addLiveForm">
        <label>
          ライブ名
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="ライブ名を入力"
          />
        </label>
        <label>
          ライブ種別
          <select
            value={liveType}
            onChange={(event) => setLiveType(event.target.value)}
          >
            <option>ワンマン</option>
            <option>フェス</option>
            <option>対バン</option>
            <option>イベント</option>
          </select>
        </label>
        <label>
          <span className="labelWithIcon">
            <CalendarDays size={14} /> 開催日
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
            placeholder="会場名を入力"
          />
        </label>
        <div className="timeFields">
          <label>
            開場
            <input
              type="time"
              value={openTime}
              onChange={(event) => setOpenTime(event.target.value)}
            />
          </label>
          <label>
            開演
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>
        </div>
        <label>
          <span className="labelWithIcon">
            <Ticket size={14} /> 座席 <small>（任意）</small>
          </span>
          <input
            value={seat}
            onChange={(event) => setSeat(event.target.value)}
            placeholder="例：アリーナ Aブロック 12列"
          />
        </label>
        <button
          className="livePrimaryButton"
          type="button"
          onClick={handleNext}
        >
          次へ
        </button>
      </section>
    </main>
  );
};

export default AddLiveBasic;
