import styles from "./SearchBar.module.css";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBar = ({
  value,
  onChange,
}: SearchBarProps) => {
  return (
    <div className={styles.searchBar}>
      <Search size={20} />

      <input
        type="text"
        placeholder="アーティストを検索"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
};

export default SearchBar;