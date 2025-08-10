import { React, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "../components/modal/Modal";
import "./bookPage.scss";

function BookPage() {
  const { bookName } = useParams();
  const [names, setNames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchNames() {
      // сначала нужно получить id документа книги
      const booksCol = collection(db, "books");
      const booksSnapshot = await getDocs(booksCol);
      const bookDoc = booksSnapshot.docs.find(
        (doc) => doc.data().name === bookName
      );
      if (!bookDoc) return;

      const namesCol = collection(db, "books", bookDoc.id, "names");
      const namesSnapshot = await getDocs(namesCol);
      const namesList = namesSnapshot.docs.map((doc) => doc.data().name);

      setNames(namesList);
      setFiltered(namesList);
    }
    fetchNames();
  }, [bookName]);

  const handleSearch = (text) => {
    setFiltered(
      names.filter((name) => name.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleAddName = async (name) => {
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const namesCol = collection(db, "books", bookDoc.id, "names");
    await addDoc(namesCol, { name });

    const updated = [...names, name];
    setNames(updated);
    setFiltered(updated);
  };

  const handleDeleteName = async (nameToDelete) => {
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const namesCol = collection(db, "books", bookDoc.id, "names");
    const namesSnapshot = await getDocs(namesCol);
    const docToDelete = namesSnapshot.docs.find(
      (doc) => doc.data().name === nameToDelete
    );
    if (docToDelete) {
      await deleteDoc(doc(db, "books", bookDoc.id, "names", docToDelete.id));
    }

    const updated = names.filter((name) => name !== nameToDelete);
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
          <li
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <span>{name}</span>
            <button
              onClick={() => handleDeleteName(name)}
              aria-label={`Видалити ${name}`}
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
            </button>
          </li>
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
