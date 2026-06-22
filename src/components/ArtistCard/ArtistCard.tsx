import styles from "./ArtistCard.module.css";
import { ChevronRight } from "lucide-react";

export interface ArtistCardProps {
  name: string;
  liveCount: number;
  lastLiveDate: string;
  image: string;
}

const ArtistCard = ({
  name,
  liveCount,
  lastLiveDate,
  image,
}: ArtistCardProps) => {
  return (
    <div className={styles.card}>
      <img
        src={image}
        alt={name}
        className={styles.artistImage}
      />

      <div className={styles.info}>
        <h3>{name}</h3>

        <p>ライブ参戦 {liveCount}回</p>

        <p>最終参戦 {lastLiveDate}</p>
      </div>

      <ChevronRight className={styles.arrow} />
    </div>
  );
};

export default ArtistCard;