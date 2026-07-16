import styles from "./SearchBar.module.css";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <label className={styles.searchBar}>
    <Search size={19} strokeWidth={2} />
    <input
      type="search"
      placeholder="アーティストを検索"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="アーティストを検索"
    />
  </label>
);

export default SearchBar;
