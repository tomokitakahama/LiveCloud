import "./ArtistDetail.css";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import type {
  Artist,
  Live,
} from "../../types/artist";

import { supabase } from "../../lib/supabase";

type ArtistDetailProps = {
  artists: Artist[];

  setArtists: React.Dispatch<
    React.SetStateAction<Artist[]>
  >;
};

const ArtistDetail = ({
  artists,
  setArtists,
}: ArtistDetailProps) => {
  const {
    artistId = "",
  } = useParams();

  const navigate =
    useNavigate();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      "lives" | "profile"
    >("lives");

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] =
    useState(false);

  /*
   * URLのUUIDと
   * Artist.idを比較して取得
   */
  const artist =
    artists.find(
      (item) =>
        item.id ===
        artistId,
    );

  if (!artist) {
    return (
      <main className="artistDetailPage artistNotFound">
        <p>
          アーティストが見つかりません
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
        >
          ホームへ戻る
        </button>
      </main>
    );
  }

  const lives: Live[] =
    artist.lives ?? [];

  /*
   * --------------------------------
   * ライブを日付順に並べる
   * --------------------------------
   */
  const timelineLives =
    [...lives].sort(
      (a, b) => {
        const aDate =
          new Date(
            a.date.replaceAll(
              "/",
              "-",
            ),
          ).getTime();

        const bDate =
          new Date(
            b.date.replaceAll(
              "/",
              "-",
            ),
          ).getTime();

        return (
          bDate -
          aDate
        );
      },
    );

  /*
   * --------------------------------
   * アーティスト削除
   * --------------------------------
   *
   * 1. artist画像のStorageパス取得
   * 2. 所属ライブ写真のStorageパス取得
   * 3. artists削除
   * 4. CascadeでDB関連データ削除
   * 5. Storage画像削除
   * 6. React state更新
   */
  const deleteArtist =
    async () => {
      const confirmed =
        window.confirm(
          `「${artist.name}」を削除しますか？\n\n登録しているライブ記録もすべて削除されます。`,
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        /*
         * --------------------------------
         * 1. artist画像のStorageパス取得
         * --------------------------------
         */
        const {
          data:
            artistRow,
          error:
            artistFetchError,
        } =
          await supabase
            .from(
              "artists",
            )
            .select(
              "image_path",
            )
            .eq(
              "id",
              artist.id,
            )
            .single();

        if (
          artistFetchError
        ) {
          console.error(
            "アーティスト画像情報取得エラー:",
            artistFetchError,
          );

          alert(
            "アーティスト情報の取得に失敗しました",
          );

          return;
        }

        const artistImagePath =
          artistRow
            ?.image_path ??
          null;

        /*
         * --------------------------------
         * 2. このアーティストの
         *    live UUID一覧を取得
         * --------------------------------
         */
        const liveIds =
          artist.lives.map(
            (live) =>
              live.id,
          );

        let livePhotoPaths:
          string[] = [];

        /*
         * ライブが存在する場合のみ
         * live_photosを検索
         */
        if (
          liveIds.length >
          0
        ) {
          const {
            data:
              livePhotoRows,
            error:
              livePhotoFetchError,
          } =
            await supabase
              .from(
                "live_photos",
              )
              .select(
                "storage_path",
              )
              .in(
                "live_id",
                liveIds,
              );

          if (
            livePhotoFetchError
          ) {
            console.error(
              "ライブ写真情報取得エラー:",
              livePhotoFetchError,
            );

            alert(
              "ライブ写真情報の取得に失敗しました",
            );

            return;
          }

          livePhotoPaths =
            (
              livePhotoRows ??
              []
            ).map(
              (photo) =>
                photo.storage_path,
            );
        }

        /*
         * --------------------------------
         * 3. artistsを削除
         * --------------------------------
         *
         * 外部キーの
         * ON DELETE CASCADE により
         *
         * lives
         * setlist_items
         * live_photos
         *
         * も削除される
         */
        const {
          error:
            artistDeleteError,
        } =
          await supabase
            .from(
              "artists",
            )
            .delete()
            .eq(
              "id",
              artist.id,
            );

        if (
          artistDeleteError
        ) {
          console.error(
            "アーティスト削除エラー:",
            artistDeleteError,
          );

          alert(
            "アーティストの削除に失敗しました",
          );

          return;
        }

        /*
         * --------------------------------
         * 4. アーティスト画像を
         *    Storageから削除
         * --------------------------------
         */
        if (
          artistImagePath
        ) {
          const {
            error:
              artistImageDeleteError,
          } =
            await supabase.storage
              .from(
                "artist-images",
              )
              .remove([
                artistImagePath,
              ]);

          if (
            artistImageDeleteError
          ) {
            /*
             * DB削除自体は成功済みなので、
             * ここでは処理を止めない
             */
            console.error(
              "アーティスト画像Storage削除エラー:",
              artistImageDeleteError,
            );
          }
        }

        /*
         * --------------------------------
         * 5. ライブ写真を
         *    Storageから削除
         * --------------------------------
         */
        if (
          livePhotoPaths.length >
          0
        ) {
          const {
            error:
              livePhotosDeleteError,
          } =
            await supabase.storage
              .from(
                "live-photos",
              )
              .remove(
                livePhotoPaths,
              );

          if (
            livePhotosDeleteError
          ) {
            /*
             * DB削除は成功済みなので
             * エラーだけ記録
             */
            console.error(
              "ライブ写真Storage削除エラー:",
              livePhotosDeleteError,
            );
          }
        }

        /*
         * --------------------------------
         * 6. React stateから削除
         * --------------------------------
         */
        setArtists(
          (
            current,
          ) =>
            current.filter(
              (item) =>
                item.id !==
                artist.id,
            ),
        );

        /*
         * Homeへ戻る
         */
        navigate(
          "/",
          {
            replace:
              true,
          },
        );
      } catch (
        error
      ) {
        console.error(
          "アーティスト削除処理エラー:",
          error,
        );

        alert(
          "アーティストの削除中にエラーが発生しました",
        );
      }
    };

  /*
   * --------------------------------
   * ライブ削除
   * --------------------------------
   *
   * ArtistDetail画面から削除する場合も
   * Supabase + Storageの両方を削除する。
   */
  const deleteLive =
    async (
      event:
        React.MouseEvent<HTMLButtonElement>,
      targetLive:
        Live,
    ) => {
      /*
       * 親articleのクリックによる
       * LiveDetail遷移を止める
       */
      event.stopPropagation();

      if (
        !window.confirm(
          `「${targetLive.title}」を削除しますか？`,
        )
      ) {
        return;
      }

      try {
        /*
         * --------------------------------
         * 1. Storageパス取得
         * --------------------------------
         */
        const {
          data:
            photoRows,
          error:
            photoFetchError,
        } =
          await supabase
            .from(
              "live_photos",
            )
            .select(
              "storage_path",
            )
            .eq(
              "live_id",
              targetLive.id,
            );

        if (
          photoFetchError
        ) {
          console.error(
            "写真情報取得エラー:",
            photoFetchError,
          );

          alert(
            "写真情報の取得に失敗しました",
          );

          return;
        }

        const storagePaths =
          (
            photoRows ??
            []
          ).map(
            (photo) =>
              photo.storage_path,
          );

        /*
         * --------------------------------
         * 2. livesを削除
         * --------------------------------
         *
         * Cascadeにより
         *
         * setlist_items
         * live_photos
         *
         * もDBから削除される。
         */
        const {
          error:
            liveDeleteError,
        } =
          await supabase
            .from(
              "lives",
            )
            .delete()
            .eq(
              "id",
              targetLive.id,
            );

        if (
          liveDeleteError
        ) {
          console.error(
            "ライブ削除エラー:",
            liveDeleteError,
          );

          alert(
            "ライブの削除に失敗しました",
          );

          return;
        }

        /*
         * --------------------------------
         * 3. Storage画像削除
         * --------------------------------
         */
        if (
          storagePaths.length >
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
                storagePaths,
              );

          if (
            storageDeleteError
          ) {
            /*
             * DB削除は成功しているので、
             * state更新は続ける。
             *
             * Storage側に不要ファイルが
             * 残る可能性だけログに記録。
             */
            console.error(
              "ライブ写真Storage削除エラー:",
              storageDeleteError,
            );
          }
        }

        /*
         * --------------------------------
         * 4. React state更新
         * --------------------------------
         */
        setArtists(
          (
            current,
          ) =>
            current.map(
              (item) => {
                if (
                  item.id !==
                  artist.id
                ) {
                  return item;
                }

                const updatedLives =
                  item.lives.filter(
                    (live) =>
                      live.id !==
                      targetLive.id,
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
                  ...item,

                  lives:
                    updatedLives,

                  liveCount:
                    updatedLives.length,

                  lastLiveDate:
                    sortedLives[0]
                      ?.date ??
                    "未登録",
                };
              },
            ),
        );
      } catch (
        error
      ) {
        console.error(
          "ライブ削除処理エラー:",
          error,
        );

        alert(
          "ライブの削除中にエラーが発生しました",
        );
      }
    };

  return (
    <main className="artistDetailPage">
      <section
        className="artistHero"
        style={
          artist.image
            ? {
                backgroundImage:
                  `linear-gradient(
                    90deg,
                    rgba(28, 25, 70, .7),
                    rgba(74, 51, 160, .38)
                  ),
                  url(${artist.image})`,
              }
            : undefined
        }
      >
        <div className="artistHeroTop">
          <button
            className="iconButton"
            type="button"
            onClick={() =>
              navigate(
                "/",
              )
            }
            aria-label="ホームへ戻る"
          >
            <ArrowLeft
              size={23}
            />
          </button>

          <div className="menuWrap">
            <button
              className="iconButton"
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (
                    open,
                  ) =>
                    !open,
                )
              }
              aria-label="アーティストの操作"
            >
              <MoreHorizontal
                size={23}
              />
            </button>

            {isMenuOpen && (
              <button
                className="deleteArtist"
                type="button"
                onClick={
                  deleteArtist
                }
              >
                <Trash2
                  size={15}
                />

                アーティストを削除
              </button>
            )}
          </div>
        </div>

        <div className="artistHeroInfo">
          {artist.image && (
            <img
              className="artistAvatar"
              src={
                artist.image
              }
              alt={`${artist.name}のアーティスト写真`}
            />
          )}

          <div>
            <h1>
              {artist.name}
            </h1>

            <p>
              ライブ参戦&nbsp;

              <strong>
                {artist.liveCount}
                回
              </strong>
            </p>
          </div>
        </div>
      </section>

      <section className="artistContent">
        <div
          className="detailTabs"
          role="tablist"
          aria-label="アーティスト情報"
        >
          <button
            className={
              activeTab ===
              "lives"
                ? "active"
                : ""
            }
            type="button"
            role="tab"
            aria-selected={
              activeTab ===
              "lives"
            }
            onClick={() =>
              setActiveTab(
                "lives",
              )
            }
          >
            ライブ一覧
          </button>

          <button
            className={
              activeTab ===
              "profile"
                ? "active"
                : ""
            }
            type="button"
            role="tab"
            aria-selected={
              activeTab ===
              "profile"
            }
            onClick={() =>
              setActiveTab(
                "profile",
              )
            }
          >
            基本情報
          </button>
        </div>

        {activeTab ===
        "lives" ? (
          <div className="liveTimeline">
            {timelineLives.length >
            0 ? (
              timelineLives.map(
                (
                  live,
                ) => (
                  <article
                    className="timelineItem"
                    key={
                      live.id
                    }
                    onClick={() =>
                      navigate(
                        `/live/${artist.id}/${live.id}`,
                      )
                    }
                  >
                    <span
                      className="timelineRail"
                      aria-hidden="true"
                    >
                      <i />
                    </span>

                    <div className="liveCopy">
                      <p className="liveDate">
                        <CalendarDays
                          size={13}
                        />

                        {live.date}
                      </p>

                      <h2>
                        {live.title}
                      </h2>

                      <p className="liveVenue">
                        <MapPin
                          size={13}
                        />

                        {live.venue ||
                          "会場未登録"}
                      </p>
                    </div>

                    {live
                      .photos?.[0] ||
                    artist.image ? (
                      <img
                        className="timelineLivePhoto"
                        src={
                          live
                            .photos?.[0] ||
                          artist.image
                        }
                        alt=""
                      />
                    ) : null}

                    <ChevronRight
                      className="liveChevron"
                      size={18}
                      aria-hidden="true"
                    />

                    <button
                      className="deleteLive"
                      type="button"
                      onClick={(
                        event,
                      ) =>
                        void deleteLive(
                          event,
                          live,
                        )
                      }
                      aria-label={`${live.title}を削除`}
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </article>
                ),
              )
            ) : (
              <div className="noLives">
                <p>
                  まだライブ記録がありません
                </p>

                <span>
                  最初のライブを追加して、思い出を残しましょう。
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="profilePanel">
            {artist.image && (
              <img
                src={
                  artist.image
                }
                alt=""
              />
            )}

            <h2>
              {artist.name}
            </h2>

            <p>
              ライブ参戦回数
            </p>

            <strong>
              {artist.liveCount}
              回
            </strong>

            <p>
              最終参戦日
            </p>

            <strong>
              {artist.lastLiveDate}
            </strong>
          </div>
        )}
      </section>

      <button
        className="addLive"
        type="button"
        onClick={() =>
          navigate(
            `/artist/${artist.id}/add-live`,
          )
        }
      >
        <Plus
          size={25}
        />
      </button>

      <BottomNavigation />
    </main>
  );
};

export default ArtistDetail;