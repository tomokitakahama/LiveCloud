import styles from "./SearchBar.module.css";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className={styles.searchContainer}>
      <Search size={20} />

      <input
        type="text"
        placeholder="アーティストを検索"
        className={styles.input}
      />
    </div>
  );
};

export default SearchBar;