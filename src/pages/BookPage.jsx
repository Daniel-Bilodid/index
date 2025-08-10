import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "../components/modal/Modal";

function BookPage() {
  const { bookName } = useParams();
  const [names, setNames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (text) => {
    setFiltered(
      names.filter((name) => name.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleAddName = (name) => {
    const updated = [...names, name];
    setNames(updated);
    setFiltered(updated);
  };

  useEffect(() => {
    setFiltered(names);
  }, [names]);

  return (
    <div className="page">
      <h2>{bookName}</h2>
      <SearchBar
        placeholder="Пошук імені..."
        onSearch={handleSearch}
        onAddClick={() => setIsModalOpen(true)}
      />
      <ul className="list">
        {filtered.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddName}
        title="Додати ім'я"
        placeholder="Додати ім'я"
      />
    </div>
  );
}

export default BookPage;
