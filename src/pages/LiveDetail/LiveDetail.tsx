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

  const [currentPhoto, setCurrentPhoto] =
  useState(0);

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
  onClick={() => navigate(`/artist/${artistId}`)}
>
        <ArrowLeft size={24} />
      </button>

      <div className="heroImage">

  {live?.photos?.length ? (

    <img
      src={live?.photos?.[currentPhoto]}
      alt={live.title}
    />

  ) : (

    <div className="noImage">

      No Image

    </div>

  )}

</div>

{live?.photos?.length! > 1 && (

<div className="heroDots">

  {live.photos.map((_: any, index: number) => (

    <button

      key={index}

      className={
        currentPhoto === index
          ? "activeDot"
          : "dot"
      }

      onClick={() =>
        setCurrentPhoto(index)
      }

    />

  ))}

</div>

)}

<h1 className="liveTitle">
  {live?.title}
</h1>

<div className="liveInfo">

  <p>📅 {live?.date}</p>

  <p>📍 {live?.venue}</p>

</div>

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

<h3>評価</h3>

<div className="ratingArea">

  {Array.from({ length: 5 }).map((_, index) => (

    <span key={index}>
      {index < (live?.rating ?? 0)
        ? "⭐"
        : "☆"}
    </span>

  ))}

</div>

<h3>セットリスト</h3>

<div className="setlistCard">

  {live?.setlist?.length ? (

    live.setlist.map((item: any, index: number) => (

      <div key={index}>

        {item.type === "song" && (

          <div className="setlistItem">

            <span className="songNumber">

              {
                live.setlist
                  .slice(0, index + 1)
                  .filter((i: any) => i.type === "song")
                  .length
              }

            </span>

            <span className="songTitle">
              {item.title}
            </span>

          </div>

        )}

        {item.type === "mc" && (

          <div className="mcDivider">

            ───── MC ─────

          </div>

        )}

        {item.type === "encore" && (

          <div className="encoreDivider">

            ──── ENCORE ────

          </div>

        )}

      </div>

    ))

  ) : (

    <p>セットリストはありません</p>

  )}

</div>

<h3>感想</h3>

<div className="memoCard">

  {live?.memo || "感想はありません"}

</div>

<h3>ライブ写真</h3>

<div className="photoCard">

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