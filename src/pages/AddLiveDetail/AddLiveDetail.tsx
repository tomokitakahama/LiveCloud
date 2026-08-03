import "./AddLiveDetail.css";

import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  Artist,
  Live,
} from "../../types/artist";

import { supabase } from "../../lib/supabase";

type SetlistItem = {
  type: "song" | "mc" | "encore";
  title?: string;
};

type BasicData = {
  title: string;
  liveType: string;
  date: string;
  venue: string;
  openTime: string;
  startTime: string;
  seat: string;
};

type AddLiveDetailProps = {
  setArtists: React.Dispatch<
    React.SetStateAction<Artist[]>
  >;
};

const compressImage = (
  file: File,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const objectUrl =
      URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(
        objectUrl,
      );

      const maxWidth = 1600;
      const maxHeight = 1600;

      let width =
        image.width;

      let height =
        image.height;

      if (
        width > maxWidth ||
        height > maxHeight
      ) {
        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height,
        );

        width = Math.round(
          width * ratio,
        );

        height = Math.round(
          height * ratio,
        );
      }

      const canvas =
        document.createElement(
          "canvas",
        );

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext(
          "2d",
        );

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
      URL.revokeObjectURL(
        objectUrl,
      );

      reject(
        new Error(
          "画像の読み込みに失敗しました",
        ),
      );
    };

    image.src = objectUrl;
  });
};

const AddLiveDetail = ({
  setArtists,
}: AddLiveDetailProps) => {
  const navigate =
    useNavigate();

  const {
    artistId = "",
  } = useParams();

  const { state } =
    useLocation();

  const basic =
    state as BasicData | null;

  const [rating, setRating] =
    useState(0);

  const [memo, setMemo] =
    useState("");

  const [setlist, setSetlist] =
    useState<SetlistItem[]>([]);

  const [photos, setPhotos] =
    useState<File[]>([]);

  const [isSaving, setIsSaving] =
    useState(false);

  if (!basic) {
    return (
      <main className="addLiveDetailPage invalidAddLive">
        <p>
          基本情報がありません
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/artist/${artistId}/add-live`,
            )
          }
        >
          入力画面へ戻る
        </button>
      </main>
    );
  }

  const addSetlistItem = (
    type: SetlistItem["type"],
  ) => {
    setSetlist(
      (items) => [
        ...items,
        {
          type,
          title:
            type === "song"
              ? ""
              : undefined,
        },
      ],
    );
  };

  const updateSong = (
    index: number,
    title: string,
  ) => {
    setSetlist(
      (items) =>
        items.map(
          (
            item,
            itemIndex,
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  title,
                }
              : item,
        ),
    );
  };

  const photoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPhotos(
      event.target.files
        ? Array.from(
            event.target.files,
          )
        : [],
    );
  };

  const handleSave =
    async () => {
      if (isSaving) {
        return;
      }

      setIsSaving(true);

      let createdLiveId:
        | string
        | null = null;

      const uploadedPaths:
        string[] = [];

      try {
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
         * 1. ライブ本体を保存
         */
        const {
          data:
            liveData,
          error:
            liveError,
        } =
          await supabase
            .from(
              "lives",
            )
            .insert({
              user_id:
                session
                  .user.id,

              artist_id:
                artistId,

              title:
                basic.title,

              date:
                basic.date ||
                null,

              venue:
                basic.venue ||
                null,

              live_type:
                basic.liveType ||
                null,

              open_time:
                basic.openTime ||
                null,

              start_time:
                basic.startTime ||
                null,

              seat:
                basic.seat ||
                null,

              rating,

              memo:
                memo ||
                null,
            })
            .select()
            .single();

        if (
          liveError
        ) {
          console.error(
            "ライブ登録エラー:",
            liveError,
          );

          alert(
            "ライブの登録に失敗しました",
          );

          return;
        }

        createdLiveId =
          liveData.id;

        /*
         * 2. セットリスト保存
         */
        if (
          setlist.length >
          0
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
                  liveData.id,

                type:
                  item.type,

                title:
                  item.type ===
                  "song"
                    ? item.title?.trim() ||
                      null
                    : null,

                position:
                  index +
                  1,
              }),
            );

          const {
            error:
              setlistError,
          } =
            await supabase
              .from(
                "setlist_items",
              )
              .insert(
                setlistRows,
              );

          if (
            setlistError
          ) {
            throw setlistError;
          }
        }

        /*
         * 3. 写真をStorageへ保存
         */
        const photoUrls:
          string[] = [];

        for (
          let index = 0;
          index <
          photos.length;
          index++
        ) {
          const file =
            photos[index];

          const compressedBlob =
            await compressImage(
              file,
            );

          const fileName =
            `${crypto.randomUUID()}.jpg`;

          const storagePath =
            `${session.user.id}/${liveData.id}/${fileName}`;

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
            throw uploadError;
          }

          uploadedPaths.push(
            storagePath,
          );

          /*
           * live_photosへパス保存
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
                  liveData.id,

                storage_path:
                  storagePath,

                position:
                  index +
                  1,
              });

          if (
            photoInsertError
          ) {
            throw photoInsertError;
          }

          /*
           * Private Bucketなので
           * 表示用Signed URLを生成
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
            throw signedError;
          }

          photoUrls.push(
            signedData.signedUrl,
          );
        }

        /*
         * 4. React state用Live
         */
        const newLive: Live =
          {
            id:
              liveData.id,

            artistId:
              liveData.artist_id,

            title:
              liveData.title,

            date:
              liveData.date ??
              "",

            venue:
              liveData.venue ??
              "",

            liveType:
              liveData.live_type ??
              "",

            openTime:
              liveData.open_time ??
              "",

            startTime:
              liveData.start_time ??
              "",

            seat:
              liveData.seat ??
              "",

            rating:
              liveData.rating ??
              0,

            memo:
              liveData.memo ??
              "",

            setlist,

            photos:
              photoUrls,
          };

        /*
         * 5. React state更新
         */
        setArtists(
          (current) =>
            current.map(
              (
                artist,
              ) =>
                artist.id ===
                artistId
                  ? {
                      ...artist,

                      liveCount:
                        artist.liveCount +
                        1,

                      lastLiveDate:
                        basic.date,

                      lives: [
                        ...artist.lives,
                        newLive,
                      ],
                    }
                  : artist,
            ),
        );

        /*
         * 6. ArtistDetailへ
         */
        navigate(
          `/artist/${artistId}`,
          {
            replace:
              true,
          },
        );
      } catch (
        error
      ) {
        console.error(
          "ライブ登録処理エラー:",
          error,
        );

        /*
         * --------------------------------
         * 失敗時の後片付け
         * --------------------------------
         */

        if (
          uploadedPaths.length >
          0
        ) {
          const {
            error:
              storageCleanupError,
          } =
            await supabase.storage
              .from(
                "live-photos",
              )
              .remove(
                uploadedPaths,
              );

          if (
            storageCleanupError
          ) {
            console.error(
              "Storage後片付けエラー:",
              storageCleanupError,
            );
          }
        }

        if (
          createdLiveId
        ) {
          /*
           * lives削除時に
           * setlist_items / live_photosも
           * ON DELETE CASCADEで削除される
           */
          const {
            error:
              liveCleanupError,
          } =
            await supabase
              .from(
                "lives",
              )
              .delete()
              .eq(
                "id",
                createdLiveId,
              );

          if (
            liveCleanupError
          ) {
            console.error(
              "ライブ後片付けエラー:",
              liveCleanupError,
            );
          }
        }

        alert(
          "ライブの登録中にエラーが発生しました",
        );
      } finally {
        setIsSaving(
          false,
        );
      }
    };

  return (
    <main className="addLiveDetailPage">
      <header className="addLiveDetailHeader">
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
            STEP 2 / 2
          </p>

          <h1>
            ライブを追加
          </h1>
        </div>

        <span />
      </header>

      <div className="detailProgress">
        <i />
      </div>

      <section className="addLiveDetailForm">
        <section>
          <h2>
            評価
          </h2>

          <div className="addStars">
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
                      index +
                        1,
                    )
                  }
                  aria-label={`${index + 1}点`}
                >
                  <Star
                    size={28}
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

        <section>
          <h2>
            セットリスト{" "}
            <small>
              （任意）
            </small>
          </h2>

          <div className="setlistActions">
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

          <div className="addSetlistRows">
            {setlist.map(
              (
                item,
                index,
              ) =>
                item.type ===
                "song" ? (
                  <div
                    className="songInputRow"
                    key={
                      index
                    }
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
                        item.title ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSong(
                          index,
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="曲名を入力"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setSetlist(
                          (
                            items,
                          ) =>
                            items.filter(
                              (
                                _,
                                itemIndex,
                              ) =>
                                itemIndex !==
                                index,
                            ),
                        )
                      }
                      aria-label="削除"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                ) : (
                  <div
                    className="setlistMarker"
                    key={
                      index
                    }
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
                        setSetlist(
                          (
                            items,
                          ) =>
                            items.filter(
                              (
                                _,
                                itemIndex,
                              ) =>
                                itemIndex !==
                                index,
                            ),
                        )
                      }
                      aria-label="削除"
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

        <section>
          <h2>
            写真{" "}
            <small>
              （任意）
            </small>
          </h2>

          <label className="photoUpload">
            <ImagePlus
              size={24}
            />

            <span>
              写真を選択
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={
                photoChange
              }
            />
          </label>

          {photos.length >
            0 && (
            <p className="selectedPhotos">
              {photos.length}
              枚の写真を選択中
            </p>
          )}
        </section>

        <section>
          <h2>
            感想メモ{" "}
            <small>
              （任意）
            </small>
          </h2>

          <textarea
            value={memo}
            onChange={(
              event,
            ) =>
              setMemo(
                event
                  .target
                  .value,
              )
            }
            placeholder="ライブの感想を残そう"
          />
        </section>

        <button
          className="addLiveSubmit"
          type="button"
          onClick={
            handleSave
          }
          disabled={
            isSaving
          }
        >
          {isSaving
            ? "追加中..."
            : "ライブを追加"}
        </button>
      </section>
    </main>
  );
};

export default AddLiveDetail;