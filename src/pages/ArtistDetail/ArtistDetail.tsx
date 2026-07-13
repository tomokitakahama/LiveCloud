import "./ArtistDetail.css";
import { ArrowLeft } from "lucide-react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

type ArtistDetailProps = {
  artists: any[];
  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const ArtistDetail = ({
  artists,
  setArtists,
}: ArtistDetailProps) => {

  // URLから artistId を取得
  const { artistId } = useParams();

  const navigate = useNavigate();

  // URLに応じたアーティスト情報を取得
  const artist = artists.find(
  (artist) =>
    artist.name.toLowerCase() === artistId
);

const handleDeleteLive = (
  deleteIndex: number
) => {

  const result = window.confirm(
    "このライブ履歴を削除しますか？"
  );

  if (!result) return;

  const updatedArtists =
    artists.map((item) => {

      if (
        item.name.toLowerCase() === artistId
      ) {

        return {
          ...item,

          lives: item.lives.filter(
            (_live, index) =>
              index !== deleteIndex
          ),

          liveCount:
            item.liveCount > 0
              ? item.liveCount - 1
              : 0,
        };
      }

      return item;
    });

  setArtists(updatedArtists);
};

  return (
  <div className="detailContainer">

    <button
      className="backButton"
      onClick={() => navigate("/")}
    >
      <ArrowLeft size={24} />
    </button>

    <div className="heroArea">

      <h1>{artist?.name}</h1>

      <p>
        <button
  className="deleteArtistButton"
  onClick={() => {

    const result = window.confirm(
      `${artist.name}を削除しますか？`
    );

    if (!result) return;

    const updatedArtists =
      artists.filter(
        (item) =>
          item.name !== artist.name
      );

    setArtists(updatedArtists);

    navigate("/");
  }}
>
  アーティストを削除
</button>

        ライブ参戦 {artist?.liveCount}回
      </p>

    </div>

    <div className="contentCard">

      <div className="tabArea">

        <button className="activeTab">
          ライブ一覧
        </button>

        <button>
          基本情報
        </button>

      </div>

  <button
  className="addLiveButton"
  onClick={() =>
    navigate(
      `/artist/${artistId}/add-live`
    )
  }
>
  ＋ ライブ追加
</button>

    {artist?.lives?.length ? (
  artist.lives?.map((live, index) => (
    <div
  className="liveItem"
  key={index}
  onClick={() =>
    navigate(
      `/live/${artistId}/${index}`
    )
  }
>

  <h3>{live.title}</h3>

  <p>
    {live.date} {live.venue}
  </p>

  <button
    className="deleteLiveButton"
    onClick={() =>
      handleDeleteLive(index)
    }
  >
    削除
  </button>
</div>
  ))
) : (
  <div className="liveItem">
    <h3>ライブ履歴がありません</h3>
  </div>
)}

    </div>

  </div>
);
};

export default ArtistDetail;