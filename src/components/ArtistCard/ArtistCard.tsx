import styles from "./ArtistCard.module.css";
import { ChevronRight } from "lucide-react";

type ArtistCardProps = {
  name: string;
  liveCount: number;
  lastLiveDate: string;
  image: string;
};

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
        className={styles.image}
      />

      <div className={styles.content}>
        <div className={styles.name}>
          {name}
        </div>

        <div className={styles.info}>
          ライブ参戦 {liveCount}回
        </div>

        <div className={styles.info}>
          最終参戦 {lastLiveDate}
        </div>
      </div>

      <ChevronRight
        size={24}
        className={styles.arrow}
      />
    </div>
  );
};

export default ArtistCard;