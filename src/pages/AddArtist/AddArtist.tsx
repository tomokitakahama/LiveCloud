import "./AddArtist.css";
import { ImagePlus, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import yoasobi from "../../assets/images/yoasobi.jpg";
import vaundy from "../../assets/images/vaundy.jpg";
import yorushika from "../../assets/images/yorushika.jpg";

type AddArtistProps = {
  artists: any[];
  setArtists: React.Dispatch<React.SetStateAction<any[]>>;
};

const profileChoices = [yoasobi, vaundy, yorushika];

const AddArtist = ({ artists, setArtists }: AddArtistProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artistName, setArtistName] = useState("");
  const [image, setImage] = useState("");

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const name = artistName.trim();
    if (!name) {
      alert("アーティスト名を入力してください");
      return;
    }

    setArtists([
      ...artists,
      { name, liveCount: 0, lastLiveDate: "未登録", image: image || yoasobi, lives: [] },
    ]);
    navigate("/");
  };

  return (
    <main className="addArtistPage">
      <header className="addArtistHeader">
        <button type="button" className="closeButton" onClick={() => navigate("/")} aria-label="追加を閉じる"><X size={25} /></button>
        <h1>アーティストを追加</h1>
        <span aria-hidden="true" />
      </header>

      <section className="addArtistForm" aria-label="アーティスト追加フォーム">
        <input ref={fileInputRef} className="fileInput" type="file" accept="image/*" onChange={selectImage} />
        <button type="button" className={`imagePicker ${image ? "hasImage" : ""}`} onClick={() => fileInputRef.current?.click()} style={image ? { backgroundImage: `url(${image})` } : undefined}>
          {!image && <><span className="imagePickerIcon"><ImagePlus size={31} /></span><span>画像を追加</span></>}
          {image && <span className="changeImage">画像を変更</span>}
        </button>

        <label className="formLabel" htmlFor="artist-name">アーティスト名</label>
        <input id="artist-name" className="artistNameInput" type="text" placeholder="アーティスト名を入力" value={artistName} onChange={(event) => setArtistName(event.target.value)} autoFocus />

        <div className="profileImageSection">
          <p className="formLabel">プロフィール画像 <span>（任意）</span></p>
          <div className="profileChoices">
            {profileChoices.map((choice) => (
              <button className={`profileChoice ${image === choice ? "selected" : ""}`} type="button" key={choice} onClick={() => setImage(choice)} aria-label="この画像を選択">
                <img src={choice} alt="" />
              </button>
            ))}
            <button className="profileAdd" type="button" onClick={() => fileInputRef.current?.click()} aria-label="画像を追加"><Plus size={30} /></button>
          </div>
        </div>

        <button type="button" className="addArtistSubmit" onClick={handleSave}>追加する</button>
      </section>
    </main>
  );
};

export default AddArtist;
