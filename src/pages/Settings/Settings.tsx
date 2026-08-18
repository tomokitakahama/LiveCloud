import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";

import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Clock3,
  Cloud,
  Database,
  Upload,
  ImageIcon,
  Info,
  PieChart,
  Sparkles,
  Trash2,
} from "lucide-react";

import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import type { Artist } from "../../types/artist";
import {
  backupFileName,
  createCompleteBackup,
  restoreCompleteBackup,
} from "../../lib/backup";

import "./Settings.css";

type SettingsProps = {
  artists: Artist[];

  setArtists: React.Dispatch<
    React.SetStateAction<Artist[]>
  >;
};

type ActionRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
};

const formatBackupDate = (
  date: Date,
) =>
  new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  )
    .format(date)
    .replace(", ", " ");

const ActionRow = ({
  icon: Icon,
  title,
  description,
  onClick,
}: ActionRowProps) => (
  <button
    type="button"
    className="settingsRow actionRow"
    onClick={onClick}
  >
    <Icon aria-hidden="true" />

    <span>
      <b>{title}</b>

      <small>
        {description}
      </small>
    </span>

    <ChevronRight
      aria-hidden="true"
      className="chevron"
    />
  </button>
);

const Settings = ({
  artists,
  setArtists,
}: SettingsProps) => {
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingBackup, setIsProcessingBackup] = useState(false);
  /*
   * --------------------------------
   * ライブ数
   * --------------------------------
   */
  const liveCount =
    artists.reduce(
      (sum, artist) =>
        sum +
        (
          artist.lives?.length ??
          0
        ),
      0,
    );

  /*
   * --------------------------------
   * 写真枚数
   * --------------------------------
   *
   * 現在 live.photos には
   * Signed URLが入っている。
   *
   * 枚数のカウントは可能。
   */
  const photoCount =
    artists.reduce(
      (sum, artist) =>
        sum +
        (
          artist.lives ??
          []
        ).reduce(
          (
            total,
            live,
          ) =>
            total +
            (
              live.photos
                ?.length ??
              0
            ),
          0,
        ),
      0,
    );

  /*
   * --------------------------------
   * 最終バックアップ日時
   * --------------------------------
   *
   * これはデータ本体ではなく
   * 小さな文字列なので
   * localStorageを使ってOK
   */
  const lastBackup =
    localStorage.getItem(
      "lastBackup",
    ) ??
    "まだありません";

  /*
   * --------------------------------
   * JSONバックアップ
   * --------------------------------
   *
   * 現在React上に読み込まれている
   * データをJSONとして保存する。
   *
   * 注意：
   * 写真URLはSigned URLなので
   * 永続的な画像バックアップではない。
   */
  const exportCompleteBackup = async () => {
    if (isProcessingBackup) return;
    setIsProcessingBackup(true);

    try {
      const blob = await createCompleteBackup(artists);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = backupFileName();
      anchor.click();
      URL.revokeObjectURL(url);
      localStorage.setItem("lastBackup", formatBackupDate(new Date()));
    } catch (error) {
      console.error("完全バックアップの作成に失敗しました:", error);
      alert("バックアップの作成に失敗しました。通信状態を確認して、もう一度お試しください。");
    } finally {
      setIsProcessingBackup(false);
    }
  };

  const restoreFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isProcessingBackup) return;

    const accepted = window.confirm(
      "この完全バックアップで現在のデータを置き換えます。現在のアーティスト・ライブ・写真は削除されます。続行しますか？",
    );
    if (!accepted) return;

    setIsProcessingBackup(true);
    try {
      await restoreCompleteBackup(file, true);
      setArtists([]);
      alert("バックアップを完全に復元しました。画面を更新します。");
      window.location.reload();
    } catch (error) {
      console.error("完全復元に失敗しました:", error);
      const message = error instanceof Error ? error.message : "復元中に予期しないエラーが発生しました。";
      alert(`復元に失敗しました。${message}`);
    } finally {
      setIsProcessingBackup(false);
    }
  };

  return (
    <main className="settingsContainer">
      <header className="settingsHeader">
        <h1>
          設定
        </h1>
      </header>

      {/* ============================= */}
      {/* データ管理 */}
      {/* ============================= */}

      <section className="settingsCard">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Cloud />
          </span>

          <div>
            <h2>
              データ管理
            </h2>

            <p>
              LiveCloudのデータを管理
            </p>
          </div>
        </div>

        <div className="settingsPanel">
          <ActionRow
            icon={Upload}
            title={isProcessingBackup ? "処理中..." : "完全バックアップを作成"}
            description="ライブ情報と写真をZIPファイルに保存"
            onClick={
              exportCompleteBackup
            }
          />

          <button
            className="settingsRow actionRow"
            type="button"
            onClick={() => restoreInputRef.current?.click()}
            disabled={isProcessingBackup}
          >
            <Database />

            <span>
              <b>
                完全バックアップから復元
              </b>

              <small>
                ZIP内のデータと写真で現在の記録を置換
              </small>
            </span>

            <ChevronRight aria-hidden="true" className="chevron" />
          </button>

          <input
            ref={restoreInputRef}
            className="backupFileInput"
            type="file"
            accept="application/zip,.zip"
            onChange={restoreFromFile}
          />

          <div className="settingsMetrics">
            <div>
              <Database />

              <span>
                保存データ件数

                <b>
                  {liveCount}

                  <small>
                    {" "}
                    ライブ
                  </small>
                </b>
              </span>
            </div>

            <div>
              <Clock3 />

              <span>
                最終バックアップ

                <b className="backupDate">
                  {lastBackup}
                </b>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 写真管理 */}
      {/* ============================= */}

      <section
        className="settingsCard comingSoonCard"
        aria-disabled="true"
      >
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <ImageIcon />
          </span>

          <div>
            <h2>
              写真管理
            </h2>

            <p>
              Supabase Storageに保存した写真
            </p>
          </div>
        </div>

        <div className="photoMetrics">
          <div>
            <ImageIcon />

            <span>
              保存写真

              <b>
                {photoCount}

                <small>
                  {" "}
                  枚
                </small>
              </b>
            </span>
          </div>

          <div>
            <PieChart />

            <span>
              保存先

              <b>
                Supabase Storage
              </b>
            </span>
          </div>
        </div>

        <button
          className="settingsRow disabledRow"
          type="button"
          disabled
        >
          <Trash2 />

          <span>
            <b>
              不要な写真を整理
            </b>

            <small>
              未使用の写真を削除して容量を確保
            </small>
          </span>

          <i className="comingSoonLabel">
            近日公開
          </i>
        </button>
      </section>

      {/* ============================= */}
      {/* 通知 */}
      {/* ============================= */}

      <section
        className="settingsCard comingSoonCard"
        aria-disabled="true"
      >
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Bell />
          </span>

          <div>
            <h2>
              通知設定
            </h2>

            <p>
              ライブ予定などの通知を設定します
            </p>
          </div>
        </div>

        <div className="settingsPanel mutedPanel">
          <div className="settingsRow disabledRow">
            <CalendarDays />

            <span>
              <b>
                ライブ予定通知
              </b>

              <small>
                登録したライブの前日にお知らせ
              </small>
            </span>

            <i className="comingSoonLabel">
              近日公開
            </i>
          </div>

          <div className="settingsRow disabledRow">
            <Sparkles />

            <span>
              <b>
                新着ライブ・更新通知
              </b>

              <small>
                アーティストの新しいライブ情報をお知らせ
              </small>
            </span>

            <i className="comingSoonLabel">
              近日公開
            </i>
          </div>

          <div className="settingsRow disabledRow">
            <CheckSquare />

            <span>
              <b>
                通知のタイミング
              </b>

              <small>
                通知を受け取る時間を設定
              </small>
            </span>

            <i className="comingSoonLabel">
              近日公開
            </i>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* アプリ情報 */}
      {/* ============================= */}

      <section className="settingsCard appInfoCard">
        <div className="settingsSectionTitle">
          <span className="sectionIcon">
            <Info />
          </span>

          <div>
            <h2>
              アプリ情報
            </h2>

            <p>
              LiveCloudの情報を確認できます
            </p>
          </div>
        </div>

        <div className="settingsPanel infoRows">
          <div className="settingsRow">
            <span>
              <b>
                アプリ名
              </b>
            </span>

            <strong>
              LiveCloud
            </strong>
          </div>

          <div className="settingsRow">
            <span>
              <b>
                Version
              </b>
            </span>

            <strong>
              1.0.0
            </strong>
          </div>

          <div className="settingsRow">
            <span>
              <b>
                最終更新日
              </b>
            </span>

            <strong>
              2026/07/26
            </strong>
          </div>
        </div>

        <p className="copyright">
          © 2026 LiveCloud
        </p>
      </section>

      <BottomNavigation />
    </main>
  );
};

export default Settings;
