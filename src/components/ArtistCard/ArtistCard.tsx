import styles from "./ArtistCard.module.css";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <button
      className={styles.card}
      onClick={() => navigate(`/artist/${name.toLowerCase()}`)}
    >
      <img
        src={image}
        alt={`${name}のアーティスト写真`}
        className={styles.image}
      />
      <span className={styles.content}>
        <span className={styles.name}>{name}</span>
        <span className={styles.info}>
          ライブ参戦&nbsp; <b>{liveCount}回</b>
        </span>
        <span className={styles.info}>最終参戦&nbsp; {lastLiveDate}</span>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        <ChevronRight size={18} strokeWidth={2.5} />
      </span>
    </button>
  );
};

export default ArtistCard;
