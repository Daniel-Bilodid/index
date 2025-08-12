import { React, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "../components/modal/Modal";
import "./bookPage.scss";

function BookPage() {
  const { bookName } = useParams();

  // Теперь каждый элемент — объект { name, page, id }
  const [names, setNames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Подгружаем имена + страницы и id документов (чтобы потом можно обновлять)
  async function fetchNames() {
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const namesCol = collection(db, "books", bookDoc.id, "names");
    const namesSnapshot = await getDocs(namesCol);

    let namesList = namesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      page: doc.data().page || "", // если нет, пустая строка
    }));

    namesList.sort((a, b) => a.name.localeCompare(b.name));

    setNames(namesList);
    setFiltered(
      namesList.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  useEffect(() => {
    fetchNames();
  }, [bookName]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setFiltered(
      names.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // Добавляем новое имя с пустой страницей
  const handleAddName = async (name) => {
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const namesCol = collection(db, "books", bookDoc.id, "names");
    await addDoc(namesCol, { name, page: "" });

    await fetchNames();
  };

  // Удаляем имя
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

    await fetchNames();
  };

  // Обновляем поле page для имени
  const handlePageChange = async (id, newPage) => {
    // Обновляем локально для быстрого UX
    const updatedNames = names.map((item) =>
      item.id === id ? { ...item, page: newPage } : item
    );
    setNames(updatedNames);
    setFiltered(
      updatedNames.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Обновляем в Firestore
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const nameDocRef = doc(db, "books", bookDoc.id, "names", id);
    await updateDoc(nameDocRef, { page: newPage });
  };

  return (
    <div className="page">
      <h2>{bookName}</h2>
      <SearchBar
        placeholder="Пошук імені..."
        onSearch={handleSearch}
        onAddClick={() => setIsModalOpen(true)}
      />
      <ul className="list">
        {filtered.map(({ id, name, page }) => (
          <li
            key={id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <input
              type="text"
              value={page}
              placeholder="Сторінка"
              style={{ width: "60px", marginRight: "10px", padding: "5px" }}
              onChange={(e) => handlePageChange(id, e.target.value)}
            />

            <span style={{ flexGrow: 1 }}>{name}</span>

            <button
              onClick={() => handleDeleteName(name)}
              aria-label={`Видалити ${name}`}
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
                fontSize: "16px",
                padding: "10px",
                color: "#bf4b56",
              }}
            >
              ✖
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={true}
        // onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddName}
        title="Додати ім'я"
        placeholder="Додати ім'я"
      />
    </div>
  );
}

export default BookPage;
