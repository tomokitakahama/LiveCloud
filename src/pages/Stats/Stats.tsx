import "./Stats.css";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

type StatsProps = {
  artists: any[];
};

const Stats = ({
  artists,
}: StatsProps) => {

  const totalArtists =
    artists.length;

  const totalLives = artists.reduce(

  (sum, artist) =>

    sum + (artist.lives?.length ?? 0),

  0

);

  const topArtist =
  artists.length > 0
    ? artists.reduce((prev, current) =>

        (prev.lives?.length ?? 0) >
        (current.lives?.length ?? 0)

          ? prev

          : current

      )

    : null;

    const currentYear =
  new Date().getFullYear();

const thisYearLives = artists.reduce(
  (sum, artist) => {

    const lives = artist.lives ?? [];

    const count = lives.filter(
      (live: any) =>
        new Date(live.date).getFullYear() === currentYear
    ).length;

    return sum + count;

  },
  0
);

const averageLives =
  artists.length > 0
    ? (totalLives / artists.length).toFixed(1)
    : "0";

    const pieData = artists.map((artist) => ({
  name: artist.name,
  value: artist.lives?.length ?? 0,
}));

const COLORS = [
  "#8B5CF6",
  "#A855F7",
  "#C084FC",
  "#60A5FA",
  "#F9A8D4",
  "#CBD5E1",
];

const yearlyMap: Record<string, number> = {};

artists.forEach((artist) => {

  (artist.lives ?? []).forEach((live: any) => {

    if (!live.date) return;

    const year = String(
      new Date(live.date).getFullYear()
    );

    yearlyMap[year] =
      (yearlyMap[year] ?? 0) + 1;

  });

});

const yearlyData = Object.keys(yearlyMap)
  .sort()
  .map((year) => ({
    year,
    count: yearlyMap[year],
  }));

const monthlyMap: Record<number, number> = {};

for (let i = 1; i <= 12; i++) {
  monthlyMap[i] = 0;
}

artists.forEach((artist) => {

  (artist.lives ?? []).forEach((live: any) => {

    if (!live.date) return;

    const date = new Date(live.date);

    if (
      date.getFullYear() === currentYear
    ) {

      monthlyMap[
        date.getMonth() + 1
      ]++;

    }

  });

});

const monthlyData = Array.from(
  { length: 12 },
  (_, index) => ({

    month: `${index + 1}月`,

    count:
      monthlyMap[index + 1],

  })
);

const artistRanking = [...artists]
  .sort(
    (a, b) =>
      (b.lives?.length ?? 0) -
      (a.lives?.length ?? 0)
  )
  .slice(0, 5);

  return (
    <div className="statsContainer">

      <h1>Statistics</h1>

      <div className="summaryGrid">

  <div className="statsCard">

    <h2>総ライブ参加数</h2>

    <p>{totalLives}回</p>

    <span>すべてのアーティスト</span>

  </div>

  <div className="statsCard">

    <h2>今年の参加数</h2>

    <p>{thisYearLives}回</p>

    <span>{currentYear}年</span>

  </div>

  <div className="statsCard">

    <h2>最多参加アーティスト</h2>

    <p>{topArtist?.name}</p>

    <span>
  {topArtist?.lives?.length ?? 0}回
</span>

  </div>

  <div className="statsCard">

    <h2>平均参加回数</h2>

    <p>{averageLives}回</p>

    <span>過去全期間</span>

  </div>

</div>

<div className="chartCard">

  <h2>アーティスト別参加割合</h2>

  <div className="pieChartArea">

    <ResponsiveContainer
      width="100%"
      height={250}
    >

      <PieChart>

        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >

          {pieData.map((entry, index) => (

            <Cell
              key={index}
              fill={
                COLORS[index % COLORS.length]
              }
            />

          ))}

        </Pie>

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>

<div className="chartCard">

  <h2>年別参加回数の推移</h2>

  <ResponsiveContainer
    width="100%"
    height={250}
  >

    <BarChart data={yearlyData}>

      <XAxis dataKey="year" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="count"
        radius={[8, 8, 0, 0]}
        fill="#8B5CF6"
      />

    </BarChart>

  </ResponsiveContainer>

</div>

<div className="chartCard">

  <h2>月別参加回数（2026年）</h2>

  <ResponsiveContainer
    width="100%"
    height={250}
  >

    <LineChart data={monthlyData}>

      <XAxis dataKey="month" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="count"
        stroke="#8B5CF6"
        strokeWidth={3}
      />

    </LineChart>

  </ResponsiveContainer>

</div>

<div className="chartCard">

  <h2>アーティストランキング</h2>

  <div className="rankingArea">

    {artistRanking.map(
      (artist, index) => (

        <div
          className="rankingRow"
          key={artist.name}
        >

          <span className="rankNumber">

            {index + 1}

          </span>

          <span className="rankName">

            {artist.name}

          </span>

          <span className="rankCount">

            {artist.lives?.length ?? 0}回

          </span>

        </div>

      )
    )}

  </div>

</div>

      <BottomNavigation />

    </div>
  );
};

export default Stats;