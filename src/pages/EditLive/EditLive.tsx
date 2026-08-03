import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  MapPin,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  Artist,
  SetlistItem,
} from "../../types/artist";

import { supabase } from "../../lib/supabase";

import "./EditLive.css";

type EditLiveProps = {
  artists: Artist[];

  setArtists: React.Dispatch<
    React.SetStateAction<Artist[]>
  >;
};

type EditableSetlistItem =
  Exclude<SetlistItem, string>;

const toEditableSetlistItem = (
  item: SetlistItem,
): EditableSetlistItem =>
  typeof item === "string"
    ? {
        type: "song",
        title: item,
      }
    : item;

/*
 * --------------------------------
 * 画像圧縮
 * --------------------------------
 *
 * ・最大1600 x 1600
 * ・JPEG
 * ・品質75%
 */
const compressImage = (
  file: File,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const objectUrl =
      URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxWidth = 1600;
      const maxHeight = 1600;

      let width = image.width;
      let height = image.height;

      if (
        width > maxWidth ||
        height > maxHeight
      ) {
        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height,
        );

        width =
          Math.round(width * ratio);

        height =
          Math.round(height * ratio);
      }

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        reject(
          new Error(
            "画像処理に失敗しました",
          ),
        );

        return;
      }

      context.drawImage(
        image,
        0,
        0,
        width,
        height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "画像圧縮に失敗しました",
              ),
            );

            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        0.75,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error(
          "画像の読み込みに失敗しました",
        ),
      );
    };

    image.src = objectUrl;
  });
};

const EditLive = ({
  artists,
  setArtists,
}: EditLiveProps) => {
  const navigate = useNavigate();

  const {
    artistId = "",
    liveId = "",
  } = useParams();

  /*
   * アーティストUUIDで検索
   */
  const artist = artists.find(
    (item) =>
      item.id === artistId,
  );

  /*
   * ライブUUIDで検索
   */
  const live =
    artist?.lives.find(
      (item) =>
        item.id === liveId,
    );

  const [title, setTitle] =
    useState(
      live?.title ?? "",
    );

  const [date, setDate] =
    useState(
      live?.date ?? "",
    );

  const [venue, setVenue] =
    useState(
      live?.venue ?? "",
    );

  const [memo, setMemo] =
    useState(
      live?.memo ?? "",
    );

  const [rating, setRating] =
    useState(
      live?.rating ?? 0,
    );

  const [photos, setPhotos] =
    useState<File[]>([]);

  const [setlist, setSetlist] =
    useState<
      EditableSetlistItem[]
    >(
      live?.setlist.map(
        toEditableSetlistItem,
      ) ?? [],
    );

  const [isSaving, setIsSaving] =
    useState(false);

  if (!artist || !live) {
    return (
      <main className="editLivePage editLiveNotFound">
        <p>
          編集するライブが見つかりませんでした。
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
        >
          戻る
        </button>
      </main>
    );
  }

  const addSetlistItem = (
    type:
      EditableSetlistItem["type"],
  ) => {
    setSetlist((items) => [
      ...items,
      type === "song"
        ? {
            type,
            title: "",
          }
        : {
            type,
          },
    ]);
  };

  const removeSetlistItem = (
    index: number,
  ) => {
    setSetlist((items) =>
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  const updateSong = (
    index: number,
    songTitle: string,
  ) => {
    setSetlist((items) =>
      items.map(
        (
          item,
          itemIndex,
        ) =>
          itemIndex === index
            ? {
                ...item,
                title:
                  songTitle,
              }
            : item,
      ),
    );
  };

  const handleSave =
    async () => {
      if (isSaving) {
        return;
      }

      if (
        !title.trim() ||
        !date ||
        !venue.trim()
      ) {
        window.alert(
          "ライブ名・日付・会場を入力してください。",
        );

        return;
      }

      setIsSaving(true);

      try {
        /*
         * --------------------------------
         * 1. ユーザー取得
         * --------------------------------
         */
        const {
          data: {
            session,
          },
          error:
            sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError
        ) {
          console.error(
            "セッション取得エラー:",
            sessionError,
          );

          alert(
            "ユーザー情報の取得に失敗しました",
          );

          return;
        }

        if (!session) {
          alert(
            "ユーザー情報が見つかりません",
          );

          return;
        }

        /*
         * --------------------------------
         * 2. lives更新
         * --------------------------------
         */
        const {
          error:
            liveUpdateError,
        } = await supabase
          .from("lives")
          .update({
            title:
              title.trim(),

            date,

            venue:
              venue.trim(),

            memo:
              memo || null,

            rating,
          })
          .eq(
            "id",
            live.id,
          );

        if (
          liveUpdateError
        ) {
          console.error(
            "ライブ更新エラー:",
            liveUpdateError,
          );

          alert(
            "ライブ情報の更新に失敗しました",
          );

          return;
        }

        /*
         * --------------------------------
         * 3. 既存セットリスト削除
         * --------------------------------
         */
        const {
          error:
            deleteSetlistError,
        } = await supabase
          .from(
            "setlist_items",
          )
          .delete()
          .eq(
            "live_id",
            live.id,
          );

        if (
          deleteSetlistError
        ) {
          console.error(
            "セットリスト削除エラー:",
            deleteSetlistError,
          );

          alert(
            "セットリストの更新に失敗しました",
          );

          return;
        }

        /*
         * --------------------------------
         * 4. 新しいセットリスト登録
         * --------------------------------
         */
        if (
          setlist.length > 0
        ) {
          const setlistRows =
            setlist.map(
              (
                item,
                index,
              ) => ({
                user_id:
                  session
                    .user.id,

                live_id:
                  live.id,

                type:
                  item.type,

                title:
                  item.type ===
                  "song"
                    ? item.title?.trim() ||
                      null
                    : null,

                position:
                  index + 1,
              }),
            );

          const {
            error:
              insertSetlistError,
          } =
            await supabase
              .from(
                "setlist_items",
              )
              .insert(
                setlistRows,
              );

          if (
            insertSetlistError
          ) {
            console.error(
              "セットリスト再登録エラー:",
              insertSetlistError,
            );

            alert(
              "セットリストの更新に失敗しました",
            );

            return;
          }
        }

        /*
         * --------------------------------
         * 5. 写真
         * --------------------------------
         *
         * 新しい写真を選択した場合だけ
         * 既存写真を差し替える
         */
        let updatedPhotoUrls =
          live.photos;

        if (
          photos.length > 0
        ) {
          /*
           * 既存のStorageパス取得
           */
          const {
            data:
              existingPhotos,
            error:
              existingPhotosError,
          } = await supabase
            .from(
              "live_photos",
            )
            .select(
              "storage_path",
            )
            .eq(
              "live_id",
              live.id,
            );

          if (
            existingPhotosError
          ) {
            console.error(
              "既存写真取得エラー:",
              existingPhotosError,
            );

            alert(
              "既存写真情報の取得に失敗しました",
            );

            return;
          }

          const existingPaths =
            (
              existingPhotos ??
              []
            ).map(
              (photo) =>
                photo.storage_path,
            );

          /*
           * Storageから既存画像削除
           */
          if (
            existingPaths.length >
            0
          ) {
            const {
              error:
                storageDeleteError,
            } =
              await supabase.storage
                .from(
                  "live-photos",
                )
                .remove(
                  existingPaths,
                );

            if (
              storageDeleteError
            ) {
              console.error(
                "既存Storage写真削除エラー:",
                storageDeleteError,
              );

              alert(
                "既存写真の削除に失敗しました",
              );

              return;
            }
          }

          /*
           * live_photosの既存行削除
           */
          const {
            error:
              photoDbDeleteError,
          } = await supabase
            .from(
              "live_photos",
            )
            .delete()
            .eq(
              "live_id",
              live.id,
            );

          if (
            photoDbDeleteError
          ) {
            console.error(
              "既存写真DB削除エラー:",
              photoDbDeleteError,
            );

            alert(
              "既存写真情報の削除に失敗しました",
            );

            return;
          }

          /*
           * 新しい写真をアップロード
           */
          const newPhotoUrls:
            string[] = [];

          for (
            let index = 0;
            index <
            photos.length;
            index++
          ) {
            const file =
              photos[index];

            /*
             * 画像圧縮
             */
            const compressedBlob =
              await compressImage(
                file,
              );

            const fileName =
              `${crypto.randomUUID()}.jpg`;

            const storagePath =
              `${session.user.id}/${live.id}/${fileName}`;

            /*
             * Storageへ保存
             */
            const {
              error:
                uploadError,
            } =
              await supabase.storage
                .from(
                  "live-photos",
                )
                .upload(
                  storagePath,

                  compressedBlob,

                  {
                    contentType:
                      "image/jpeg",

                    upsert:
                      false,
                  },
                );

            if (
              uploadError
            ) {
              console.error(
                "写真アップロードエラー:",
                uploadError,
              );

              alert(
                "写真のアップロードに失敗しました",
              );

              return;
            }

            /*
             * live_photosへ登録
             */
            const {
              error:
                photoInsertError,
            } =
              await supabase
                .from(
                  "live_photos",
                )
                .insert({
                  user_id:
                    session
                      .user.id,

                  live_id:
                    live.id,

                  storage_path:
                    storagePath,

                  position:
                    index +
                    1,
                });

            if (
              photoInsertError
            ) {
              console.error(
                "写真情報登録エラー:",
                photoInsertError,
              );

              /*
               * DB登録失敗時は
               * Storageに残った画像を削除
               */
              await supabase.storage
                .from(
                  "live-photos",
                )
                .remove([
                  storagePath,
                ]);

              alert(
                "写真情報の保存に失敗しました",
              );

              return;
            }

            /*
             * Signed URL生成
             */
            const {
              data:
                signedData,
              error:
                signedError,
            } =
              await supabase.storage
                .from(
                  "live-photos",
                )
                .createSignedUrl(
                  storagePath,
                  60 * 60,
                );

            if (
              signedError
            ) {
              console.error(
                "写真Signed URL生成エラー:",
                signedError,
              );

              alert(
                "写真表示用URLの生成に失敗しました",
              );

              return;
            }

            newPhotoUrls.push(
              signedData.signedUrl,
            );
          }

          updatedPhotoUrls =
            newPhotoUrls;
        }

        /*
         * --------------------------------
         * 6. React state更新
         * --------------------------------
         */
        setArtists(
          (
            currentArtists,
          ) =>
            currentArtists.map(
              (
                currentArtist,
              ) => {
                if (
                  currentArtist.id !==
                  artist.id
                ) {
                  return currentArtist;
                }

                const updatedLives =
                  currentArtist.lives.map(
                    (
                      currentLive,
                    ) =>
                      currentLive.id ===
                      live.id
                        ? {
                            ...currentLive,

                            title:
                              title.trim(),

                            date,

                            venue:
                              venue.trim(),

                            memo,

                            rating,

                            setlist,

                            photos:
                              updatedPhotoUrls,
                          }
                        : currentLive,
                  );

                /*
                 * 最終参戦日再計算
                 */
                const sortedLives =
                  [
                    ...updatedLives,
                  ].sort(
                    (
                      a,
                      b,
                    ) =>
                      new Date(
                        b.date,
                      ).getTime() -
                      new Date(
                        a.date,
                      ).getTime(),
                  );

                return {
                  ...currentArtist,

                  lives:
                    updatedLives,

                  lastLiveDate:
                    sortedLives[0]
                      ?.date ??
                    "未登録",
                };
              },
            ),
        );

        /*
         * --------------------------------
         * 7. LiveDetailへ戻る
         * --------------------------------
         */
        navigate(
          `/live/${artist.id}/${live.id}`,
          {
            replace:
              true,
          },
        );
      } catch (
        error
      ) {
        console.error(
          "ライブ更新中のエラー:",
          error,
        );

        alert(
          "ライブの更新中にエラーが発生しました",
        );
      } finally {
        setIsSaving(
          false,
        );
      }
    };

  return (
    <main className="editLivePage">
      <header className="editLiveHeader">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          aria-label="戻る"
        >
          <ArrowLeft
            size={23}
          />
        </button>

        <div>
          <p>
            LIVE RECORD
          </p>

          <h1>
            ライブを編集
          </h1>
        </div>

        <span
          aria-hidden="true"
        />
      </header>

      <form
        className="editLiveForm"
        onSubmit={(
          event,
        ) => {
          event.preventDefault();

          void handleSave();
        }}
      >
        <section className="editSection">
          <h2>
            基本情報
          </h2>

          <label>
            ライブ名

            <input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <div className="editTwoColumns">
            <label>
              <span className="labelWithIcon">
                <CalendarDays
                  size={14}
                />
                日付
              </span>

              <input
                type="date"
                value={date}
                onChange={(
                  event,
                ) =>
                  setDate(
                    event.target
                      .value,
                  )
                }
              />
            </label>

            <label>
              <span className="labelWithIcon">
                <MapPin
                  size={14}
                />
                会場
              </span>

              <input
                value={venue}
                onChange={(
                  event,
                ) =>
                  setVenue(
                    event.target
                      .value,
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className="editSection ratingSection">
          <h2>
            評価
          </h2>

          <div
            className="editStars"
            aria-label={`評価 ${rating} / 5`}
          >
            {Array.from(
              {
                length: 5,
              },
              (
                _,
                index,
              ) => (
                <button
                  type="button"
                  key={index}
                  className={
                    index <
                    rating
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRating(
                      index + 1,
                    )
                  }
                  aria-label={`${index + 1}点`}
                >
                  <Star
                    size={29}
                    fill="currentColor"
                  />
                </button>
              ),
            )}

            <span>
              {rating
                ? `${rating}.0`
                : "未評価"}
            </span>
          </div>
        </section>

        <section className="editSection">
          <h2>
            セットリスト{" "}
            <small>
              任意
            </small>
          </h2>

          <div className="editSetlistActions">
            <button
              type="button"
              onClick={() =>
                addSetlistItem(
                  "song",
                )
              }
            >
              <Plus
                size={15}
              />
              曲を追加
            </button>

            <button
              type="button"
              onClick={() =>
                addSetlistItem(
                  "mc",
                )
              }
            >
              MC
            </button>

            <button
              type="button"
              onClick={() =>
                addSetlistItem(
                  "encore",
                )
              }
            >
              ENCORE
            </button>
          </div>

          <div className="editSetlistRows">
            {setlist.map(
              (
                item,
                index,
              ) =>
                item.type ===
                "song" ? (
                  <div
                    className="editSongRow"
                    key={index}
                  >
                    <b>
                      {
                        setlist
                          .slice(
                            0,
                            index +
                              1,
                          )
                          .filter(
                            (
                              value,
                            ) =>
                              value.type ===
                              "song",
                          )
                          .length
                      }
                    </b>

                    <input
                      value={
                        item.title ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSong(
                          index,
                          event.target
                            .value,
                        )
                      }
                      placeholder="曲名を入力"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSetlistItem(
                          index,
                        )
                      }
                      aria-label="曲を削除"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                ) : (
                  <div
                    className="editSetlistMarker"
                    key={index}
                  >
                    <span>
                      {item.type ===
                      "mc"
                        ? "MC"
                        : "ENCORE"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSetlistItem(
                          index,
                        )
                      }
                      aria-label={`${item.type}を削除`}
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                ),
            )}
          </div>
        </section>

        <section className="editSection">
          <h2>
            感想メモ{" "}
            <small>
              任意
            </small>
          </h2>

          <textarea
            value={memo}
            onChange={(
              event,
            ) =>
              setMemo(
                event.target
                  .value,
              )
            }
            placeholder="ライブの感想を残しましょう"
          />
        </section>

        <section className="editSection">
          <h2>
            写真{" "}
            <small>
              任意
            </small>
          </h2>

          <label className="editPhotoUpload">
            <ImagePlus
              size={24}
            />

            <span>
              写真を差し替え
            </span>

            <small>
              現在{" "}
              {
                live.photos
                  .length
              }{" "}
              枚
            </small>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(
                event,
              ) =>
                setPhotos(
                  event.target
                    .files
                    ? Array.from(
                        event.target
                          .files,
                      )
                    : [],
                )
              }
            />
          </label>

          {photos.length >
            0 && (
            <p className="selectedPhotos">
              差し替える写真：
              {photos.length}
              枚
            </p>
          )}
        </section>

        <button
          className="editLiveSubmit"
          type="submit"
          disabled={
            isSaving
          }
        >
          {isSaving
            ? "保存中..."
            : "変更を保存"}
        </button>
      </form>
    </main>
  );
};

export default EditLive;