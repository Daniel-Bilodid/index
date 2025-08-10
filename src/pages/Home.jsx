import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "../components/modal/Modal";
import "./home.scss";

function Home() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (text) => {
    setFiltered(
      books.filter((book) => book.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleAddBook = (bookName) => {
    const updated = [...books, bookName];
    setBooks(updated);
    setFiltered(updated);
  };

  useEffect(() => {
    setFiltered(books);
  }, [books]);

  return (
    <div className="page">
      <h1>INDEX</h1>
      <SearchBar
        placeholder="Пошук книги..."
        onSearch={handleSearch}
        onAddClick={() => setIsModalOpen(true)}
      />
      <ul className="list">
        {filtered.map((book, i) => (
          <li
            key={i}
            onClick={() => navigate(`/book/${encodeURIComponent(book)}`)}
          >
            {book}
          </li>
        ))}
      </ul>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBook}
        title="Додати книгу"
        placeholder="Назва книги"
      />
    </div>
  );
}

export default Home;
