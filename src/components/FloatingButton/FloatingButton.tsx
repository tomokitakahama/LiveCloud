import styles from "./FloatingButton.module.css";
import { Plus } from "lucide-react";

type FloatingButtonProps = {
  onClick?: () => void;
};

const FloatingButton = ({ onClick }: FloatingButtonProps) => {
  return (
    <button
      className={styles.floatingButton}
      onClick={onClick}
    >
      <Plus size={28} />
    </button>
  );
};

export default FloatingButton;