import type { Artist, Live } from "./types/artist";
import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import ArtistDetail from "./pages/ArtistDetail/ArtistDetail";
import AddArtist from "./pages/AddArtist/AddArtist";
import LiveDetail from "./pages/LiveDetail/LiveDetail";
import EditLive from "./pages/EditLive/EditLive";
import AddLiveBasic from "./pages/AddLiveBasic/AddLiveBasic";
import AddLiveDetail from "./pages/AddLiveDetail/AddLiveDetail";
import Stats from "./pages/Stats/Stats";
import Settings from "./pages/Settings/Settings";

import { supabase } from "./lib/supabase";

function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  /*
   * --------------------------------
   * Supabase Auth 初期化
   * --------------------------------
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "セッション取得エラー:",
          sessionError
        );

        return;
      }

      if (session) {
        console.log(
          "既存ユーザーID:",
          session.user.id
        );

        setIsAuthReady(true);

        return;
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signInAnonymously();

      if (error) {
        console.error(
          "匿名ログインエラー:",
          error
        );

        return;
      }

      console.log(
        "匿名ユーザーを作成しました:",
        data.user?.id
      );

      setIsAuthReady(true);
    };

    initializeAuth();
  }, []);

  /*
   * --------------------------------
   * Supabaseから
   *
   * artists
   *   ↓
   * lives
   *   ├ setlist_items
   *   └ live_photos
   *
   * を取得
   * --------------------------------
   */
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const fetchArtists = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "セッション取得エラー:",
          sessionError
        );

        return;
      }

      if (!session) {
        console.error(
          "ユーザーセッションが存在しません"
        );

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("artists")
        .select(`
          id,
          name,
          image_path,
          created_at,

          lives (
            id,
            artist_id,
            title,
            date,
            venue,
            live_type,
            open_time,
            start_time,
            seat,
            rating,
            memo,
            created_at,

            setlist_items (
              id,
              type,
              title,
              position
            ),

            live_photos (
              id,
              storage_path,
              position
            )
          )
        `)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "アーティスト・ライブ・セットリスト・写真取得エラー:",
          error
        );

        return;
      }

      /*
       * --------------------------------
       * Supabaseデータ
       * ↓
       * React用データへ変換
       * --------------------------------
       */
      const convertedArtists: Artist[] =
        await Promise.all(
          data.map(async (artist) => {
            /*
             * --------------------------------
             * アーティスト画像
             * --------------------------------
             *
             * artist-images はPrivateなので
             * image_pathからSigned URLを作成
             */
            let artistImageUrl = "";

            if (artist.image_path) {
              const {
                data: signedArtistImage,
                error: artistImageError,
              } = await supabase.storage
                .from("artist-images")
                .createSignedUrl(
                  artist.image_path,
                  60 * 60
                );

              if (artistImageError) {
                console.error(
                  "アーティスト画像Signed URL取得エラー:",
                  artistImageError
                );
              } else {
                artistImageUrl =
                  signedArtistImage.signedUrl;
              }
            }

            /*
             * --------------------------------
             * ライブ一覧
             * --------------------------------
             */
            const convertedLives: Live[] =
              await Promise.all(
                (artist.lives ?? []).map(
                  async (live) => {
                    /*
                     * -------------------------
                     * セットリスト
                     * -------------------------
                     */
                    const convertedSetlist =
                      [
                        ...(live.setlist_items ??
                          []),
                      ]
                        .sort(
                          (a, b) =>
                            a.position -
                            b.position
                        )
                        .map((item) => ({
                          type:
                            item.type as
                              | "song"
                              | "mc"
                              | "encore",

                          title:
                            item.type ===
                            "song"
                              ? item.title ??
                                ""
                              : undefined,
                        }));

                    /*
                     * -------------------------
                     * ライブ写真
                     * -------------------------
                     */
                    const sortedPhotos =
                      [
                        ...(live.live_photos ??
                          []),
                      ].sort(
                        (a, b) =>
                          a.position -
                          b.position
                      );

                    /*
                     * Private Bucketなので
                     * Signed URLを作成
                     */
                    const photoUrls =
                      await Promise.all(
                        sortedPhotos.map(
                          async (photo) => {
                            const {
                              data:
                                signedData,
                              error:
                                signedError,
                            } =
                              await supabase.storage
                                .from(
                                  "live-photos"
                                )
                                .createSignedUrl(
                                  photo.storage_path,
                                  60 * 60
                                );

                            if (
                              signedError
                            ) {
                              console.error(
                                "写真Signed URL取得エラー:",
                                signedError
                              );

                              return "";
                            }

                            return (
                              signedData.signedUrl
                            );
                          }
                        )
                      );

                    return {
                      id:
                        live.id,

                      artistId:
                        live.artist_id,

                      title:
                        live.title,

                      date:
                        live.date ?? "",

                      venue:
                        live.venue ?? "",

                      liveType:
                        live.live_type ??
                        "",

                      openTime:
                        live.open_time ??
                        "",

                      startTime:
                        live.start_time ??
                        "",

                      seat:
                        live.seat ?? "",

                      rating:
                        live.rating ?? 0,

                      memo:
                        live.memo ?? "",

                      setlist:
                        convertedSetlist,

                      photos:
                        photoUrls.filter(
                          (url) =>
                            url !== ""
                        ),
                    };
                  }
                )
              );

            /*
             * --------------------------------
             * 最新ライブを取得
             * --------------------------------
             */
            const sortedLives =
              [...convertedLives].sort(
                (a, b) => {
                  const aDate =
                    new Date(
                      a.date
                    ).getTime();

                  const bDate =
                    new Date(
                      b.date
                    ).getTime();

                  return (
                    bDate -
                    aDate
                  );
                }
              );

            /*
             * --------------------------------
             * Artist型へ変換
             * --------------------------------
             */
            return {
              id:
                artist.id,

              name:
                artist.name,

              liveCount:
                convertedLives.length,

              lastLiveDate:
                sortedLives[0]
                  ?.date ??
                "未登録",

              /*
               * image_pathではなく
               * Signed URLを使用
               */
              image:
                artistImageUrl,

              lives:
                convertedLives,
            };
          })
        );

      setArtists(
        convertedArtists
      );

      console.log(
        "Supabaseから全データ取得成功:",
        data
      );
    };

    fetchArtists();
  }, [isAuthReady]);

  return (
    <HashRouter>
      <div className="appContainer">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/artist/:artistId"
            element={
              <ArtistDetail
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/add-artist"
            element={
              <AddArtist
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/stats"
            element={
              <Stats
                artists={
                  artists
                }
              />
            }
          />

          <Route
            path="/live/:artistId/:liveId"
            element={
              <LiveDetail
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/artist/:artistId/live/:liveId/edit"
            element={
              <EditLive
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/artist/:artistId/add-live"
            element={
              <AddLiveBasic />
            }
          />

          <Route
            path="/artist/:artistId/add-live/detail"
            element={
              <AddLiveDetail
                setArtists={
                  setArtists
                }
              />
            }
          />

          <Route
            path="/settings"
            element={
              <Settings
                artists={
                  artists
                }
                setArtists={
                  setArtists
                }
              />
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;