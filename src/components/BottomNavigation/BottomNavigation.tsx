import styles from "./BottomNavigation.module.css";
import {
  House,
  ChartPie,
  CirclePlus,
  Settings
} from "lucide-react";

const BottomNavigation = () => {
  return (
    <nav className={styles.navigation}>
      <button className={styles.navItem}>
        <House size={24} />
        <span>ホーム</span>
      </button>

      <button className={styles.navItem}>
        <ChartPie size={24} />
        <span>統計</span>
      </button>

      <button className={styles.navItem}>
        <CirclePlus size={24} />
        <span>追加</span>
      </button>

      <button className={styles.navItem}>
        <Settings size={24} />
        <span>設定</span>
      </button>
    </nav>
  );
};

export default BottomNavigation;