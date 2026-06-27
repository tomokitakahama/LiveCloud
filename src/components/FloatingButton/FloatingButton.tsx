import styles from "./FloatingButton.module.css";
import { Plus } from "lucide-react";

const FloatingButton = () => {
  return (
    <button className={styles.button}>
      <Plus size={32} />
    </button>
  );
};

export default FloatingButton;