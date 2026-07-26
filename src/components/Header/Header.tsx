import styles from "./Header.module.css";
import { Bell } from "lucide-react";

const Header = () => {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.logo}>LiveCloud</h1>
      </div>

      <button className={styles.notificationButton}>
        <Bell size={22} />
      </button>
    </header>
  );
};

export default Header;
