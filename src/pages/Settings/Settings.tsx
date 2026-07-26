import "./Settings.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SettingsProps = {
  artists: any[];
  setArtists: React.Dispatch<
    React.SetStateAction<any[]>
  >;
};

const Settings = ({
  artists,
}: SettingsProps) => {

  const navigate = useNavigate();

  const artistCount = artists.length;

  const liveCount = artists.reduce(
    (sum, artist) =>
      sum + (artist.lives?.length ?? 0),
    0
  );

  const photoCount = artists.reduce(
    (sum, artist) =>

      sum +

      (artist.lives ?? []).reduce(
        (liveSum: number, live: any) =>

          liveSum +
          (live.photos?.length ?? 0),

        0
      ),

    0
  );

  const exportJson = () => {

  const json = JSON.stringify(
    artists,
    null,
    2
  );

  const blob = new Blob(
    [json],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `LiveCloud_${new Date()
      .toLocaleDateString("ja-JP")
      .replaceAll("/", "-")}.json`;

  a.click();

  URL.revokeObjectURL(url);

};

  return (

    <div className="settingsContainer">

      <button
        className="backButton"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
      </button>

      <h1>設定</h1>

      <div className="settingCard">

        <h2>☁ データ管理</h2>

        <div className="dataRow">

          <span>アーティスト</span>

          <span>{artistCount}組</span>

        </div>

        <div className="dataRow">

          <span>ライブ</span>

          <span>{liveCount}件</span>

        </div>

        <div className="dataRow">

          <span>写真</span>

          <span>{photoCount}枚</span>

        </div>

        <button
  className="dataButton"
  onClick={exportJson}
>

  JSONを書き出す

</button>

      </div>

    </div>

  );
};

export default Settings;