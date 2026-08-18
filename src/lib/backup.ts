import JSZip from "jszip";

import type { Artist } from "../types/artist";
import { supabase } from "./supabase";

const BACKUP_VERSION = "2.0.0";
const BACKUP_FILE_NAME = "backup.json";

type BackupSetlistItem = {
  type: "song" | "mc" | "encore";
  title?: string;
};

type BackupLive = {
  title: string;
  date: string;
  venue: string;
  liveType: string;
  openTime: string;
  startTime: string;
  seat: string;
  rating: number;
  memo: string;
  setlist: BackupSetlistItem[];
  photoFiles: string[];
};

type BackupArtist = {
  name: string;
  imageFile: string | null;
  lives: BackupLive[];
};

export type CompleteBackup = {
  app: "LiveCloud";
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  artists: BackupArtist[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringValue = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new Error(`${field} の形式が正しくありません。`);
  }

  return value;
};

const optionalStringValue = (value: unknown, field: string) => {
  if (value === undefined || value === null) return "";
  return stringValue(value, field);
};

const setlistItem = (value: unknown): BackupSetlistItem => {
  if (!isRecord(value)) throw new Error("セットリストの形式が正しくありません。");

  const type = stringValue(value.type, "セットリスト種別");
  if (type !== "song" && type !== "mc" && type !== "encore") {
    throw new Error("セットリスト種別が正しくありません。");
  }

  const title = optionalStringValue(value.title, "セットリスト名");
  return type === "song" ? { type, title } : { type };
};

const parseBackup = (value: unknown): CompleteBackup => {
  if (!isRecord(value)) throw new Error("バックアップファイルの形式が正しくありません。");
  if (value.app !== "LiveCloud" || value.version !== BACKUP_VERSION) {
    throw new Error("このファイルは対応していないLiveCloud完全バックアップです。");
  }
  if (!Array.isArray(value.artists)) throw new Error("アーティスト一覧が見つかりません。");

  return {
    app: "LiveCloud",
    version: BACKUP_VERSION,
    exportedAt: stringValue(value.exportedAt, "書き出し日時"),
    artists: value.artists.map((artistValue, artistIndex) => {
      if (!isRecord(artistValue)) throw new Error("アーティストの形式が正しくありません。");
      if (!Array.isArray(artistValue.lives)) throw new Error("ライブ一覧の形式が正しくありません。");

      const imageFile = artistValue.imageFile;
      if (imageFile !== null && typeof imageFile !== "string") {
        throw new Error("アーティスト画像の形式が正しくありません。");
      }

      return {
        name: stringValue(artistValue.name, `アーティスト${artistIndex + 1}の名前`),
        imageFile,
        lives: artistValue.lives.map((liveValue, liveIndex) => {
          if (!isRecord(liveValue)) throw new Error("ライブの形式が正しくありません。");
          if (!Array.isArray(liveValue.setlist) || !Array.isArray(liveValue.photoFiles)) {
            throw new Error("ライブ詳細の形式が正しくありません。");
          }
          if (typeof liveValue.rating !== "number" || !Number.isFinite(liveValue.rating)) {
            throw new Error("評価の形式が正しくありません。");
          }

          return {
            title: stringValue(liveValue.title, `ライブ${liveIndex + 1}のタイトル`),
            date: optionalStringValue(liveValue.date, "開催日"),
            venue: optionalStringValue(liveValue.venue, "会場"),
            liveType: optionalStringValue(liveValue.liveType, "ライブ種別"),
            openTime: optionalStringValue(liveValue.openTime, "開場時刻"),
            startTime: optionalStringValue(liveValue.startTime, "開演時刻"),
            seat: optionalStringValue(liveValue.seat, "座席"),
            rating: liveValue.rating,
            memo: optionalStringValue(liveValue.memo, "メモ"),
            setlist: liveValue.setlist.map(setlistItem),
            photoFiles: liveValue.photoFiles.map((path) => stringValue(path, "写真ファイル名")),
          };
        }),
      };
    }),
  };
};

const extensionFor = (blob: Blob) => {
  if (blob.type === "image/png") return "png";
  if (blob.type === "image/webp") return "webp";
  return "jpg";
};

const downloadBlob = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("画像ファイルの取得に失敗しました。");
  return response.blob();
};

export const createCompleteBackup = async (artists: Artist[]) => {
  const zip = new JSZip();
  const backupArtists: BackupArtist[] = [];

  for (let artistIndex = 0; artistIndex < artists.length; artistIndex += 1) {
    const artist = artists[artistIndex];
    let imageFile: string | null = null;

    if (artist.image) {
      const blob = await downloadBlob(artist.image);
      imageFile = `images/artists/${artistIndex + 1}.${extensionFor(blob)}`;
      zip.file(imageFile, blob);
    }

    const lives: BackupLive[] = [];
    for (let liveIndex = 0; liveIndex < artist.lives.length; liveIndex += 1) {
      const live = artist.lives[liveIndex];
      const photoFiles: string[] = [];
      for (let photoIndex = 0; photoIndex < live.photos.length; photoIndex += 1) {
        const blob = await downloadBlob(live.photos[photoIndex]);
        const fileName = `images/lives/${artistIndex + 1}-${liveIndex + 1}/${photoIndex + 1}.${extensionFor(blob)}`;
        zip.file(fileName, blob);
        photoFiles.push(fileName);
      }

      lives.push({
        title: live.title,
        date: live.date,
        venue: live.venue,
        liveType: live.liveType,
        openTime: live.openTime,
        startTime: live.startTime,
        seat: live.seat,
        rating: live.rating,
        memo: live.memo,
        setlist: live.setlist.map((item) => {
          if (typeof item === "string") return { type: "song", title: item };
          return item.type === "song" ? { type: item.type, title: item.title ?? "" } : { type: item.type };
        }),
        photoFiles,
      });
    }

    backupArtists.push({ name: artist.name, imageFile, lives });
  }

  const backup: CompleteBackup = {
    app: "LiveCloud",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    artists: backupArtists,
  };
  zip.file(BACKUP_FILE_NAME, JSON.stringify(backup, null, 2));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
};

const readArchive = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const manifest = zip.file(BACKUP_FILE_NAME);
  if (!manifest) throw new Error("backup.json が見つかりません。");
  const backup = parseBackup(JSON.parse(await manifest.async("text")));

  for (const artist of backup.artists) {
    if (artist.imageFile && !zip.file(artist.imageFile)) throw new Error("アーティスト画像が不足しています。");
    for (const live of artist.lives) {
      for (const photoFile of live.photoFiles) {
        if (!zip.file(photoFile)) throw new Error("ライブ写真が不足しています。");
      }
    }
  }

  return { backup, zip };
};

const toSetlistRows = (items: BackupSetlistItem[], userId: string, liveId: string) =>
  items.map((item, index) => ({
    user_id: userId,
    live_id: liveId,
    type: item.type,
    title: item.type === "song" ? item.title?.trim() || null : null,
    position: index + 1,
  }));

export const restoreCompleteBackup = async (file: File, replaceExisting = true) => {
  const { backup, zip } = await readArchive(file);
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error("ユーザー情報を取得できませんでした。");

  const userId = session.user.id;
  const createdArtistIds: string[] = [];
  const uploadedArtistPaths: string[] = [];
  const uploadedLivePaths: string[] = [];
  const oldArtistPaths: string[] = [];
  const oldLivePaths: string[] = [];
  let oldArtistIds: string[] = [];

  try {
    if (replaceExisting) {
      const { data: oldArtists, error: oldArtistsError } = await supabase
        .from("artists").select("id, image_path");
      if (oldArtistsError) throw oldArtistsError;
      oldArtistIds = oldArtists.map((artist) => artist.id);
      oldArtistPaths.push(...oldArtists.flatMap((artist) => artist.image_path ? [artist.image_path] : []));

      const { data: oldPhotos, error: oldPhotosError } = await supabase
        .from("live_photos").select("storage_path");
      if (oldPhotosError) throw oldPhotosError;
      oldLivePaths.push(...oldPhotos.map((photo) => photo.storage_path));
    }

    for (const artist of backup.artists) {
      const { data: artistRow, error: artistError } = await supabase
        .from("artists")
        .insert({ user_id: userId, name: artist.name, image_path: null })
        .select("id")
        .single();
      if (artistError) throw artistError;
      createdArtistIds.push(artistRow.id);

      if (artist.imageFile) {
        const image = zip.file(artist.imageFile);
        if (!image) throw new Error("アーティスト画像が見つかりません。");
        const blob = await image.async("blob");
        const imagePath = `${userId}/${artistRow.id}/profile.${extensionFor(blob)}`;
        const { error: uploadError } = await supabase.storage.from("artist-images")
          .upload(imagePath, blob, { contentType: blob.type || "image/jpeg", upsert: false });
        if (uploadError) throw uploadError;
        uploadedArtistPaths.push(imagePath);
        const { error: imagePathError } = await supabase.from("artists")
          .update({ image_path: imagePath }).eq("id", artistRow.id);
        if (imagePathError) throw imagePathError;
      }

      for (const live of artist.lives) {
        const { data: liveRow, error: liveError } = await supabase
          .from("lives")
          .insert({
            user_id: userId,
            artist_id: artistRow.id,
            title: live.title,
            date: live.date || null,
            venue: live.venue || null,
            live_type: live.liveType || null,
            open_time: live.openTime || null,
            start_time: live.startTime || null,
            seat: live.seat || null,
            rating: live.rating,
            memo: live.memo || null,
          })
          .select("id")
          .single();
        if (liveError) throw liveError;

        if (live.setlist.length > 0) {
          const { error: setlistError } = await supabase.from("setlist_items")
            .insert(toSetlistRows(live.setlist, userId, liveRow.id));
          if (setlistError) throw setlistError;
        }

        for (let index = 0; index < live.photoFiles.length; index += 1) {
          const photo = zip.file(live.photoFiles[index]);
          if (!photo) throw new Error("ライブ写真が見つかりません。");
          const blob = await photo.async("blob");
          const path = `${userId}/${liveRow.id}/${crypto.randomUUID()}.${extensionFor(blob)}`;
          const { error: uploadError } = await supabase.storage.from("live-photos")
            .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
          if (uploadError) throw uploadError;
          uploadedLivePaths.push(path);
          const { error: photoError } = await supabase.from("live_photos").insert({
            user_id: userId, live_id: liveRow.id, storage_path: path, position: index + 1,
          });
          if (photoError) throw photoError;
        }
      }
    }

    if (replaceExisting && oldArtistIds.length > 0) {
      const { error: deleteError } = await supabase.from("artists").delete().in("id", oldArtistIds);
      if (deleteError) throw deleteError;
      if (oldArtistPaths.length > 0) await supabase.storage.from("artist-images").remove(oldArtistPaths);
      if (oldLivePaths.length > 0) await supabase.storage.from("live-photos").remove(oldLivePaths);
    }
  } catch (error) {
    if (createdArtistIds.length > 0) await supabase.from("artists").delete().in("id", createdArtistIds);
    if (uploadedArtistPaths.length > 0) await supabase.storage.from("artist-images").remove(uploadedArtistPaths);
    if (uploadedLivePaths.length > 0) await supabase.storage.from("live-photos").remove(uploadedLivePaths);
    throw error;
  }

  return backup;
};

export const backupFileName = () => `LiveCloud_complete_${new Date().toISOString().slice(0, 10)}.zip`;
