import styles from "./BottomNavigation.module.css";
import {
  House,
  ChartPie,
  UserPlus
} from "lucide-react";

const BottomNavigation = () => {
  return (
    <nav className={styles.navigation}>
      <button className={styles.navItem}>
        <House size={24} />
        <span>Home</span>
      </button>

      <button className={styles.navItem}>
        <ChartPie size={24} />
        <span>統計</span>
      </button>

      <button className={styles.navItem}>
        <UserPlus size={24} />
        <span>追加</span>
      </button>
    </nav>
  );
};

export default BottomNavigation;