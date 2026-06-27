import "./ArtistDetail.css";
import { ArrowLeft } from "lucide-react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

const ArtistDetail = () => {

  // URLから artistId を取得
  const { artistId } = useParams();

  const navigate = useNavigate();

  // アーティストデータ（今はモック）
  const artists = {
    yoasobi: {
      name: "YOASOBI",
      liveCount: 12,
    },

    vaundy: {
      name: "Vaundy",
      liveCount: 5,
    },

    yorushika: {
      name: "ヨルシカ",
      liveCount: 8,
    },

    clanqueen: {
      name: "CLAN QUEEN",
      liveCount: 3,
    },
  };

  // URLに応じたアーティスト情報を取得
  const artist =
    artists[artistId as keyof typeof artists];

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

      <div className="liveItem">
        <h3>YOASOBI DOME LIVE 2026</h3>
        <p>2026/05/01 東京ドーム</p>
      </div>

      <div className="liveItem">
        <h3>YOASOBI ARENA TOUR 2025</h3>
        <p>2025/12/10 有明アリーナ</p>
      </div>

    </div>

  </div>
);
};

export default ArtistDetail;