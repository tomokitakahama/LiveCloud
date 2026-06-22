import styles from "./ArtistCard.module.css";

type ArtistCardProps = {
  name: string;
  liveCount: number;
  lastLiveDate: string;
};

const ArtistCard = ({
  name,
  liveCount,
  lastLiveDate,
}: ArtistCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.image}></div>

      <h3>{name}</h3>

      <p>ライブ {liveCount}回</p>

      <p>最終参戦 {lastLiveDate}</p>
    </div>
  );
};

export default ArtistCard;