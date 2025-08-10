import { React, useState } from "react";

function SearchBar({ placeholder, onSearch, onAddClick }) {
  const [query, setQuery] = useState("");
  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      <button onClick={onAddClick}>+</button>
    </div>
  );
}

export default SearchBar;
