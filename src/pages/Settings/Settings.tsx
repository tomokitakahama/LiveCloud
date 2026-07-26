import { useRef } from "react";
import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Clock3,
  Cloud,
  Database,
  Download,
  ImageIcon,
  Info,
  PieChart,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import type { Artist } from "../../types/artist";
import "./Settings.css";

type SettingsProps = {
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

type ActionRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
};

const formatBackupDate = (date: Date) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll("/", "/")
    .replace(", ", " ");

/** Reusable action row for backup and restore controls. */
const ActionRow = ({
  icon: Icon,
  title,
  description,
  onClick,
}: ActionRowProps) => (
  <button type="button" className="settingsRow actionRow" onClick={onClick}>
    <Icon aria-hidden="true" />
    <span>
      <b>{title}</b>
      <small>{description}</small>
    </span>
    <ChevronRight aria-hidden="true" className="chevron" />
  </button>
);

const Settings = ({ artists, setArtists }: SettingsProps) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const liveCount = artists.reduce(
    (sum, artist) => sum + (artist.lives?.length ?? 0),
    0,
  );
  const photoCount = artists.reduce(
    (sum, artist) =>
      sum +
      (artist.lives ?? []).reduce(
        (total, live) => total + (live.photos?.length ?? 0),
        0,
      ),
    0,
  );
  const photoBytes = artists.reduce(
    (sum, artist) =>
      sum +
      (artist.lives ?? []).reduce(
        (total, live) =>
          total +
          (live.photos ?? []).reduce(
            (photoTotal, photo) => photoTotal + photo.length,
            0,
          ),
        0,
      ),
    0,
  );
  const photoSize = `${(photoBytes / 1024 / 1024).toFixed(1)} MB`;
  const lastBackup = localStorage.getItem("lastBackup") ?? "まだありません";

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(artists, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `LiveCloud_${new Date().toLocaleDateString("ja-JP").replaceAll("/", "-")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    localStorage.setItem("lastBackup", formatBackupDate(new Date()));
  };

  const importJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedArtists = JSON.parse(String(reader.result));
        if (!Array.isArray(importedArtists)) throw new Error("Invalid backup");
        if (
          window.confirm(
            "現在のデータをバックアップファイルの内容で置き換えますか？",
          )
        ) {
          setArtists(importedArtists);
          localStorage.setItem("artists", JSON.stringify(importedArtists));
          localStorage.setItem("lastBackup", formatBackupDate(new Date()));
          window.alert("データを復元しました");
        }
      } catch {
        window.alert("読み込めないJSONファイルです");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="settingsContainer">
      <header className="settingsHeader">
        <h1>設定</h1>
      </header>

      <section className="settingsCard">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Cloud />
          </span>
          <div>
            <h2>データ管理</h2>
            <p>大切なライブデータをバックアップ・復元します</p>
          </div>
        </div>
        <div className="settingsPanel">
          <ActionRow
            icon={Upload}
            title="JSONでバックアップ"
            description="データをJSONファイルに保存"
            onClick={exportJson}
          />
          <ActionRow
            icon={Download}
            title="JSONから復元"
            description="JSONファイルからデータを復元"
            onClick={() => importInputRef.current?.click()}
          />
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={importJson}
          />
          <div className="settingsMetrics">
            <div>
              <Database />
              <span>
                保存データ件数
                <b>
                  {liveCount}
                  <small> ライブ</small>
                </b>
              </span>
            </div>
            <div>
              <Clock3 />
              <span>
                最終バックアップ<b className="backupDate">{lastBackup}</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="settingsCard comingSoonCard" aria-disabled="true">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <ImageIcon />
          </span>
          <div>
            <h2>
              写真管理 <em>近日公開</em>
            </h2>
            <p>保存しているライブ写真の情報を確認できます</p>
          </div>
        </div>
        <div className="photoMetrics">
          <div>
            <ImageIcon />
            <span>
              保存写真
              <b>
                {photoCount}
                <small> 枚</small>
              </b>
            </span>
          </div>
          <div>
            <PieChart />
            <span>
              使用容量<b>{photoSize}</b>
            </span>
          </div>
        </div>
        <button className="settingsRow disabledRow" type="button" disabled>
          <Trash2 />
          <span>
            <b>不要な写真を整理</b>
            <small>未使用の写真を削除して容量を確保</small>
          </span>
          <em>近日公開</em>
        </button>
      </section>

      <section className="settingsCard comingSoonCard" aria-disabled="true">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Bell />
          </span>
          <div>
            <h2>
              通知設定 <em>近日公開</em>
            </h2>
            <p>ライブ予定などの通知を設定します</p>
          </div>
        </div>
        <div className="settingsPanel mutedPanel">
          <div className="settingsRow disabledRow">
            <CalendarDays />
            <span>
              <b>ライブ予定通知</b>
              <small>登録したライブの前日にお知らせ</small>
            </span>
            <em>近日公開</em>
          </div>
          <div className="settingsRow disabledRow">
            <Sparkles />
            <span>
              <b>新着ライブ・更新通知</b>
              <small>アーティストの新しいライブ情報をお知らせ</small>
            </span>
            <em>近日公開</em>
          </div>
          <div className="settingsRow disabledRow">
            <CheckSquare />
            <span>
              <b>通知のタイミング</b>
              <small>通知を受け取る時間を設定</small>
            </span>
            <em>近日公開</em>
          </div>
        </div>
      </section>

      <section className="settingsCard appInfoCard">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Info />
          </span>
          <div>
            <h2>アプリ情報</h2>
            <p>LiveCloudの情報を確認できます</p>
          </div>
        </div>
        <div className="settingsPanel infoRows">
          <div className="settingsRow">
            <span>
              <b>アプリ名</b>
            </span>
            <strong>LiveCloud</strong>
          </div>
          <div className="settingsRow">
            <span>
              <b>Version</b>
            </span>
            <strong>1.0.0</strong>
          </div>
          <div className="settingsRow">
            <span>
              <b>開発者</b>
            </span>
            <strong>高濱 誠晃</strong>
          </div>
          <div className="settingsRow">
            <span>
              <b>最終更新日</b>
            </span>
            <strong>2026/07/26</strong>
          </div>
        </div>
        <p className="copyright">© 2026 LiveCloud</p>
      </section>
      <BottomNavigation />
    </main>
  );
};

export default Settings;
