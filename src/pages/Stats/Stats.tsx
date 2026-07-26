import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Crown, Music2, Ticket } from "lucide-react";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import "./Stats.css";

type Live = { date?: string };
type Artist = { name: string; lives?: Live[] };

type StatsProps = {
  artists: Artist[];
};

const COLORS = [
  "#6f45f6",
  "#8b5cf6",
  "#a855f7",
  "#d565df",
  "#62a7f3",
  "#cfd9f2",
];

const getDateParts = (value?: string) => {
  const match = value?.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: string | number }>;
};

/** Tooltip shared by both trend charts. */
const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return <div className="chartTooltip">{payload[0].value}回</div>;
};

const Stats = ({ artists }: StatsProps) => {
  const [activeTab, setActiveTab] = useState<"summary" | "trend" | "artists">(
    "summary",
  );
  const currentYear = new Date().getFullYear();

  const data = useMemo(() => {
    const totalLives = artists.reduce(
      (sum, artist) => sum + (artist.lives?.length ?? 0),
      0,
    );
    const topArtist = [...artists].sort(
      (a, b) => (b.lives?.length ?? 0) - (a.lives?.length ?? 0),
    )[0];
    const thisYearLives = artists.reduce(
      (sum, artist) =>
        sum +
        (artist.lives ?? []).filter(
          (live) => getDateParts(live.date)?.year === currentYear,
        ).length,
      0,
    );

    const shares = artists
      .map((artist) => ({
        name: artist.name,
        value: artist.lives?.length ?? 0,
      }))
      .filter((artist) => artist.value > 0);
    const visibleShares = shares.slice(0, 5);
    const otherCount = shares
      .slice(5)
      .reduce((sum, artist) => sum + artist.value, 0);
    if (otherCount) visibleShares.push({ name: "その他", value: otherCount });

    const yearlyMap: Record<number, number> = {};
    const monthlyMap = Array.from({ length: 12 }, () => 0);
    artists.forEach((artist) =>
      (artist.lives ?? []).forEach((live) => {
        const parts = getDateParts(live.date);
        if (!parts) return;
        yearlyMap[parts.year] = (yearlyMap[parts.year] ?? 0) + 1;
        if (parts.year === currentYear) monthlyMap[parts.month - 1] += 1;
      }),
    );

    const years = Object.keys(yearlyMap)
      .map(Number)
      .sort((a, b) => a - b);
    const startYear = years.length
      ? Math.min(years[0], currentYear - 4)
      : currentYear - 4;
    const yearlyData = Array.from(
      { length: currentYear - startYear + 1 },
      (_, index) => {
        const year = startYear + index;
        return { year: String(year), count: yearlyMap[year] ?? 0 };
      },
    );

    return {
      totalLives,
      topArtist,
      thisYearLives,
      averageLives: artists.length
        ? (totalLives / artists.length).toFixed(1)
        : "0.0",
      shares: visibleShares,
      yearlyData,
      monthlyData: monthlyMap.map((count, index) => ({
        month: `${index + 1}月`,
        count,
      })),
      ranking: [...artists].sort(
        (a, b) => (b.lives?.length ?? 0) - (a.lives?.length ?? 0),
      ),
    };
  }, [artists, currentYear]);

  return (
    <main className="statsContainer">
      <header className="statsHeader">
        <h1>統計</h1>
        <BarChart3 size={22} aria-hidden="true" />
      </header>

      <div className="statsTabs" role="tablist" aria-label="統計の表示切り替え">
        {[
          ["summary", "サマリー"],
          ["trend", "推移"],
          ["artists", "アーティスト別"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id as typeof activeTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <>
          <section className="summaryGrid" aria-label="ライブ参加サマリー">
            <article className="statsCard">
              <Ticket />
              <p>総ライブ参加数</p>
              <strong>
                {data.totalLives}
                <small>回</small>
              </strong>
              <span>すべてのアーティスト</span>
            </article>
            <article className="statsCard">
              <Music2 />
              <p>今年の参加数</p>
              <strong>
                {data.thisYearLives}
                <small>回</small>
              </strong>
              <span>{currentYear}年</span>
            </article>
            <article className="statsCard">
              <Crown />
              <p>最も参戦したアーティスト</p>
              <strong className="artistName">
                {data.topArtist?.name ?? "-"}
              </strong>
              <span>{data.topArtist?.lives?.length ?? 0}回</span>
            </article>
            <article className="statsCard">
              <BarChart3 />
              <p>平均年間参加数</p>
              <strong>
                {data.averageLives}
                <small>回</small>
              </strong>
              <span>登録アーティストあたり</span>
            </article>
          </section>
          <section className="chartCard shareCard">
            <h2>アーティスト別参加割合</h2>
            {data.shares.length ? (
              <div className="shareContent">
                <ResponsiveContainer width="50%" height={190}>
                  <PieChart>
                    <Pie
                      data={data.shares}
                      dataKey="value"
                      innerRadius={49}
                      outerRadius={76}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {data.shares.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ul className="shareLegend">
                  {data.shares.map((artist, index) => (
                    <li key={artist.name}>
                      <i
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span>{artist.name}</span>
                      <b>
                        {data.totalLives
                          ? ((artist.value / data.totalLives) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </b>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="emptyChart">ライブを登録すると集計が表示されます</p>
            )}
          </section>
        </>
      )}

      {activeTab === "trend" && (
        <>
          <section className="chartCard">
            <h2>年別参加回数の推移</h2>
            <ResponsiveContainer width="100%" height={235}>
              <BarChart
                data={data.yearlyData}
                margin={{ top: 12, right: 2, left: -24, bottom: 0 }}
              >
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#7950f2" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
          <section className="chartCard">
            <h2>月別参加回数（{currentYear}年）</h2>
            <ResponsiveContainer width="100%" height={235}>
              <LineChart
                data={data.monthlyData}
                margin={{ top: 12, right: 10, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7b49f5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#fff", strokeWidth: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      )}

      {activeTab === "artists" && (
        <section className="chartCard">
          <h2>アーティスト別参加回数</h2>
          <ol className="rankingArea">
            {data.ranking.length ? (
              data.ranking.map((artist, index) => (
                <li className="rankingRow" key={artist.name}>
                  <span className="rankNumber">{index + 1}</span>
                  <span className="rankName">{artist.name}</span>
                  <strong>
                    {artist.lives?.length ?? 0}
                    <small>回</small>
                  </strong>
                </li>
              ))
            ) : (
              <li className="emptyChart">
                アーティストを追加すると表示されます
              </li>
            )}
          </ol>
        </section>
      )}
      <BottomNavigation />
    </main>
  );
};

export default Stats;
