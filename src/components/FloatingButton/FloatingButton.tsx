import styles from "./FloatingButton.module.css";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingButton = () => {

  const navigate = useNavigate();

  return (
    <button
      className={styles.button}
      onClick={() => navigate("/add-artist")}
    >
      <Plus size={32} />
    </button>
  );
};

export default FloatingButton;