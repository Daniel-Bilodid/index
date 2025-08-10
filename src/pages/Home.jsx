import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "../components/modal/Modal";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase"; // путь к файлу конфигурации

import "./home.scss";

function Home() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      const booksCol = collection(db, "books");
      const booksSnapshot = await getDocs(booksCol);
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setBooks(booksList.map((b) => b.name));
      setFiltered(booksList.map((b) => b.name));
    }
    fetchBooks();
  }, []);

  const handleSearch = (text) => {
    setFiltered(
      books.filter((book) => book.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleAddBook = async (bookName) => {
    // добавляем в Firestore
    const booksCol = collection(db, "books");
    await addDoc(booksCol, { name: bookName });

    // обновляем локально
    const updated = [...books, bookName];
    setBooks(updated);
    setFiltered(updated);
  };

  const handleDeleteBook = async (bookToDelete) => {
    // сначала найдем id книги
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const docToDelete = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookToDelete
    );

    if (docToDelete) {
      await deleteDoc(doc(db, "books", docToDelete.id));
    }

    // обновляем локально
    const updated = books.filter((book) => book !== bookToDelete);
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
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
            onClick={() => navigate(`/book/${encodeURIComponent(book)}`)}
          >
            <span>{book}</span>
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBook(book);
              }}
              aria-label={`Видалити ${book}`}
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
                fontSize: "16px",
                padding: "10px",
                color: "red",
              }}
            >
              ✖
            </button> */}
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
