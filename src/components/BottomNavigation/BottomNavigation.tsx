import { useLocation, useNavigate } from "react-router-dom";
import styles from "./BottomNavigation.module.css";
import {
  House,
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  Settings,
} from "lucide-react";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { label: "ホーム", icon: House, path: "/" },
    { label: "統計", icon: ChartNoAxesColumnIncreasing, path: "/stats" },
    { label: "追加", icon: CirclePlus, path: "/add-artist" },
    { label: "設定", icon: Settings, path: "/settings" },
  ];

  return (
    <nav className={styles.navigation} aria-label="メインナビゲーション">
      {items.map(({ label, icon: Icon, path }) => (
        <button
          className={`${styles.navItem} ${location.pathname === path ? styles.active : ""}`}
          key={label}
          onClick={() => path && navigate(path)}
          type="button"
        >
          <Icon size={22} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;
