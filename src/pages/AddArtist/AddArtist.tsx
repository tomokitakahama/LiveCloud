import "./AddArtist.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type AddArtistProps = {
  artists: any[];
  setArtists: React.Dispatch<React.SetStateAction<any[]>>;
};

const AddArtist = ({
  artists,
  setArtists,
}: AddArtistProps) => {

  const navigate = useNavigate();

  const [artistName, setArtistName] =
    useState("");

  const [image, setImage] =
    useState("");

  const handleSave = () => {

    if (!artistName.trim()) {
      alert("アーティスト名を入力してください");
      return;
    }

   setArtists([
  ...artists,
  {
    name: artistName,
    liveCount: 0,
    lastLiveDate: "未参戦",
    image: image || "/src/assets/images/yoasobi.jpg",
    lives: [],
  },
]);

    navigate("/");
  };

  return (
    <div className="addArtistContainer">

      <button
        className="backButton"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={24} />
      </button>

      <h1>アーティスト追加</h1>

      <div className="formArea">

        <label>アーティスト名</label>

        <input
          type="text"
          placeholder="例：YOASOBI"
          value={artistName}
          onChange={(e) =>
            setArtistName(e.target.value)
          }
        />

        <label>画像</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        const imageUrl =
          URL.createObjectURL(file);

          setImage(imageUrl);
        }}
        />

        <label>メモ</label>

        <textarea
          placeholder="好きな曲や思い出を入力"
        />

        <button
          className="saveButton"
          onClick={handleSave}
        >
          保存
        </button>

      </div>
    </div>
  );
};

export default AddArtist;