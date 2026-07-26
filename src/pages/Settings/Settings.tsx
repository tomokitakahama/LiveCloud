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
  setArtists,
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

const importJson = (
  event: React.ChangeEvent<HTMLInputElement>
) => {

  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    try {

      const json = JSON.parse(
        e.target?.result as string
      );

      if (
        window.confirm(
          "現在のデータを上書きしますか？"
        )
      ) {

        setArtists(json);

        localStorage.setItem(
          "artists",
          JSON.stringify(json)
        );

        localStorage.setItem(
          "lastBackup",
          new Date().toLocaleString("ja-JP")
        );

        alert("復元しました");

      }

    } catch {

      alert("JSONファイルではありません");

    }

  };

  reader.readAsText(file);

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

<label className="dataButton">

  JSONから復元

  <input
    type="file"
    accept=".json"
    hidden
    onChange={importJson}
  />

</label>

      </div>

    </div>

  );
};

export default Settings;