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

  const totalLives =
    artists.reduce(
      (sum, artist) =>
        sum + artist.liveCount,
      0
    );

  const topArtist =
    artists.reduce((prev, current) => {

      return prev.liveCount >
        current.liveCount
        ? prev
        : current;
    });

    const currentYear =
  new Date().getFullYear();

const thisYearLives = artists.reduce(
  (sum, artist) => {

    const count =
      artist.lives.filter((live: any) =>

        new Date(live.date).getFullYear() ===
        currentYear

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
  value: artist.liveCount,
}));

const COLORS = [
  "#8B5CF6",
  "#A855F7",
  "#C084FC",
  "#60A5FA",
  "#F9A8D4",
  "#CBD5E1",
];

const yearlyData = [
  { year: "2022", count: 3 },
  { year: "2023", count: 5 },
  { year: "2024", count: 7 },
  { year: "2025", count: 7 },
  { year: "2026", count: totalLives },
];

const monthlyData = [
  { month: "1月", count: 0 },
  { month: "2月", count: 1 },
  { month: "3月", count: 1 },
  { month: "4月", count: 2 },
  { month: "5月", count: 3 },
  { month: "6月", count: 1 },
];

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

    <span>{topArtist?.liveCount}回</span>

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

      <BottomNavigation />

    </div>
  );
};

export default Stats;