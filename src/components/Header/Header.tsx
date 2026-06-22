import styles from "./Header.module.css";
import { Bell } from "lucide-react";

const Header = () => {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.logo}>LiveCloud</h1>

        <p className={styles.subtitle}>
          ライブの思い出を、ずっとそばに。
        </p>
      </div>

      <button className={styles.notificationButton}>
        <Bell size={22} />
      </button>
    </header>
  );
};

export default Header;