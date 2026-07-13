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

        <h2>{live?.title}</h2>

        <div className="infoCard">

  <div className="infoRow">
    <span>ライブ種別</span>
    <strong>{live?.liveType}</strong>
  </div>

  <div className="infoRow">
    <span>開催日</span>
    <strong>{live?.date}</strong>
  </div>

  <div className="infoRow">
    <span>会場</span>
    <strong>{live?.venue}</strong>
  </div>

  <div className="infoRow">
    <span>開場</span>
    <strong>{live?.openTime}</strong>
  </div>

  <div className="infoRow">
    <span>開演</span>
    <strong>{live?.startTime}</strong>
  </div>

  <div className="infoRow">
    <span>座席</span>
    <strong>{live?.seat || "未登録"}</strong>
  </div>

</div>

<div className="ratingArea">

  {Array.from({ length: 5 }).map((_, index) => (

    <span key={index}>
      {index < (live?.rating ?? 0)
        ? "⭐"
        : "☆"}
    </span>

  ))}

</div>

<p>{live?.date}</p>

<p>{live?.venue}</p>

<h3>感想</h3>

<p>
  {live?.memo || "感想はありません"}
</p>

<h3>ライブ写真</h3>

<h3>セットリスト</h3>

<div className="setlistArea">

  {live?.setlist?.length ? (

    live.setlist.map((song, index) => (

      <div
        key={index}
        className="setlistItem"
      >

        <span className="songNumber">
          {index + 1}
        </span>

        <span>{song}</span>

      </div>

    ))

  ) : (

    <p>セットリストはありません</p>

  )}

</div>

<div className="photoArea">

  {live?.photos?.length ? (

    live.photos.map((photo, index) => (

      <img
        key={index}
        src={photo}
        alt={`photo-${index}`}
        className="livePhoto"
      />

    ))

  ) : (

    <p>写真はありません</p>

  )}

</div>

<button
  className="editButton"
  onClick={() =>
    navigate(
      `/artist/${artistId}/live/${liveId}/edit`
    )
  }
>
  編集する
</button>

      </div>

    </div>

  );
};

export default LiveDetail;