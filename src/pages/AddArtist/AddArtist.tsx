import "./AddArtist.css";

import {
  ImagePlus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Artist,
} from "../../types/artist";

import {
  supabase,
} from "../../lib/supabase";

type AddArtistProps = {
  artists: Artist[];

  setArtists: React.Dispatch<
    React.SetStateAction<Artist[]>
  >;
};

/*
 * --------------------------------
 * アーティスト画像を圧縮
 * --------------------------------
 *
 * ・最大 1200 × 1200
 * ・JPEG
 * ・品質 80%
 *
 * Storage容量を節約するため、
 * 元画像をそのままアップロードしない
 */
const compressImage = (
  file: File,
): Promise<Blob> => {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      const objectUrl =
        URL.createObjectURL(
          file,
        );

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl,
        );

        const maxWidth =
          1200;

        const maxHeight =
          1200;

        let width =
          image.width;

        let height =
          image.height;

        if (
          width >
            maxWidth ||
          height >
            maxHeight
        ) {
          const ratio =
            Math.min(
              maxWidth /
                width,

              maxHeight /
                height,
            );

          width =
            Math.round(
              width *
                ratio,
            );

          height =
            Math.round(
              height *
                ratio,
            );
        }

        const canvas =
          document.createElement(
            "canvas",
          );

        canvas.width =
          width;

        canvas.height =
          height;

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

            resolve(
              blob,
            );
          },

          "image/jpeg",

          0.8,
        );
      };

      image.onerror =
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );

          reject(
            new Error(
              "画像の読み込みに失敗しました",
            ),
          );
        };

      image.src =
        objectUrl;
    },
  );
};

const AddArtist = ({
  setArtists,
}: AddArtistProps) => {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    artistName,
    setArtistName,
  ] = useState("");

  /*
   * Base64文字列ではなく
   * Fileそのものを保持
   */
  const [
    imageFile,
    setImageFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  /*
   * --------------------------------
   * 画像プレビュー
   * --------------------------------
   *
   * Base64には変換せず、
   * 一時的なblob URLで表示
   */
  const imagePreview =
    useMemo(() => {
      if (!imageFile) {
        return "";
      }

      return URL.createObjectURL(
        imageFile,
      );
    }, [imageFile]);

  /*
   * blob URLは
   * 不要になったら解放
   */
  useEffect(() => {
    return () => {
      if (
        imagePreview
      ) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  const selectImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * 念のため画像だけ許可
     */
    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      alert(
        "画像ファイルを選択してください",
      );

      return;
    }

    /*
     * Bucket側は5MB制限だが、
     * 圧縮前の画像についても
     * 極端に大きいものを防ぐ
     */
    if (
      file.size >
      20 *
        1024 *
        1024
    ) {
      alert(
        "画像サイズが大きすぎます",
      );

      return;
    }

    setImageFile(
      file,
    );
  };

  const handleSave =
    async () => {
      const name =
        artistName.trim();

      if (!name) {
        alert(
          "アーティスト名を入力してください",
        );

        return;
      }

      if (isSaving) {
        return;
      }

      setIsSaving(
        true,
      );

      /*
       * エラー時の後片付け用
       */
      let createdArtistId:
        | string
        | null = null;

      let uploadedPath:
        | string
        | null = null;

      try {
        /*
         * --------------------------------
         * 1. ログインユーザー取得
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
         * 2. まずartistsへ登録
         * --------------------------------
         *
         * この時点ではまだ画像なし
         */
        const {
          data:
            artistData,

          error:
            artistError,
        } =
          await supabase
            .from(
              "artists",
            )
            .insert({
              user_id:
                session
                  .user.id,

              name,

              image_path:
                null,
            })
            .select()
            .single();

        if (
          artistError
        ) {
          console.error(
            "アーティスト登録エラー:",
            artistError,
          );

          alert(
            "アーティストの登録に失敗しました",
          );

          return;
        }

        createdArtistId =
          artistData.id;

        /*
         * Reactで表示する画像URL
         *
         * 画像なしの場合は空文字
         */
        let displayImage =
          "";

        /*
         * --------------------------------
         * 3. 画像が選択されている場合
         * --------------------------------
         */
        if (imageFile) {
          /*
           * ブラウザ上で圧縮
           */
          const compressedBlob =
            await compressImage(
              imageFile,
            );

          /*
           * Storageパス
           *
           * userId/
           *   artistId/
           *     profile.jpg
           */
          const storagePath =
            `${session.user.id}/${artistData.id}/profile.jpg`;

          /*
           * --------------------------------
           * 4. Storageへアップロード
           * --------------------------------
           */
          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "artist-images",
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

          uploadedPath =
            storagePath;

          /*
           * --------------------------------
           * 5. artists.image_pathを更新
           * --------------------------------
           *
           * Signed URLではなく
           * StorageパスをDBに保存する
           */
          const {
            error:
              updateError,
          } =
            await supabase
              .from(
                "artists",
              )
              .update({
                image_path:
                  storagePath,
              })
              .eq(
                "id",
                artistData.id,
              );

          if (
            updateError
          ) {
            throw updateError;
          }

          /*
           * --------------------------------
           * 6. 画面表示用Signed URL
           * --------------------------------
           *
           * BucketがPrivateなので
           * 一時URLを作る
           */
          const {
            data:
              signedData,

            error:
              signedError,
          } =
            await supabase.storage
              .from(
                "artist-images",
              )
              .createSignedUrl(
                storagePath,

                // 1時間
                60 * 60,
              );

          if (
            signedError
          ) {
            throw signedError;
          }

          displayImage =
            signedData.signedUrl;
        }

        /*
         * --------------------------------
         * 7. React state更新
         * --------------------------------
         */
        setArtists(
          (current) => [
            ...current,

            {
              id:
                artistData.id,

              name:
                artistData.name,

              liveCount:
                0,

              lastLiveDate:
                "未登録",

              image:
                displayImage,

              lives: [],
            },
          ],
        );

        console.log(
          "アーティスト登録成功:",
          artistData,
        );

        navigate(
          "/",
        );
      } catch (
        error
      ) {
        console.error(
          "アーティスト登録処理エラー:",
          error,
        );

        /*
         * --------------------------------
         * エラー時の後片付け
         * --------------------------------
         */

        /*
         * Storageにアップロード済みなら削除
         */
        if (
          uploadedPath
        ) {
          const {
            error:
              storageCleanupError,
          } =
            await supabase.storage
              .from(
                "artist-images",
              )
              .remove([
                uploadedPath,
              ]);

          if (
            storageCleanupError
          ) {
            console.error(
              "画像後片付けエラー:",
              storageCleanupError,
            );
          }
        }

        /*
         * artistsの登録まで済んでいたら
         * そのレコードも削除
         */
        if (
          createdArtistId
        ) {
          const {
            error:
              artistCleanupError,
          } =
            await supabase
              .from(
                "artists",
              )
              .delete()
              .eq(
                "id",
                createdArtistId,
              );

          if (
            artistCleanupError
          ) {
            console.error(
              "アーティスト後片付けエラー:",
              artistCleanupError,
            );
          }
        }

        alert(
          "アーティストの登録中にエラーが発生しました",
        );
      } finally {
        setIsSaving(
          false,
        );
      }
    };

  return (
    <main className="addArtistPage">
      <header className="addArtistHeader">
        <button
          type="button"
          className="closeButton"
          onClick={() =>
            navigate("/")
          }
          aria-label="追加を閉じる"
        >
          <X
            size={25}
          />
        </button>

        <h1>
          アーティストを追加
        </h1>

        <span
          aria-hidden="true"
        />
      </header>

      <section
        className="addArtistForm"
        aria-label="アーティスト追加フォーム"
      >
        <input
          ref={
            fileInputRef
          }
          className="fileInput"
          type="file"
          accept="image/*"
          onChange={
            selectImage
          }
        />

        <button
          type="button"
          className={`imagePicker ${
            imagePreview
              ? "hasImage"
              : ""
          }`}
          onClick={() =>
            fileInputRef.current?.click()
          }
          style={
            imagePreview
              ? {
                  backgroundImage:
                    `url(${imagePreview})`,
                }
              : undefined
          }
        >
          {!imagePreview && (
            <>
              <span className="imagePickerIcon">
                <ImagePlus
                  size={31}
                />
              </span>

              <span>
                画像を追加
              </span>
            </>
          )}

          {imagePreview && (
            <span className="changeImage">
              画像を変更
            </span>
          )}
        </button>

        <label
          className="formLabel"
          htmlFor="artist-name"
        >
          アーティスト名
        </label>

        <input
          id="artist-name"
          className="artistNameInput"
          type="text"
          placeholder="アーティスト名を入力"
          value={
            artistName
          }
          onChange={(
            event,
          ) =>
            setArtistName(
              event.target
                .value,
            )
          }
          autoFocus
        />

        <button
          type="button"
          className="addArtistSubmit"
          onClick={
            handleSave
          }
          disabled={
            isSaving
          }
        >
          {isSaving
            ? "追加中..."
            : "追加する"}
        </button>
      </section>
    </main>
  );
};

export default AddArtist;