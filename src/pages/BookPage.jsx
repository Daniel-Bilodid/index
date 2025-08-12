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

  const [names, setNames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // для редактирования имени
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

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
      page: doc.data().page || "",
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

  const handleAddName = async (name) => {
    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const namesCol = collection(db, "books", bookDoc.id, "names");
    const namesSnapshot = await getDocs(namesCol);

    const exists = namesSnapshot.docs.some(
      (doc) =>
        doc.data().name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      console.warn("Таке ім'я вже є у базі");
      return;
    }

    await addDoc(namesCol, { name, page: "" });
    await fetchNames();
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

    await fetchNames();
  };

  const handlePageChange = async (id, newPage) => {
    const updatedNames = names.map((item) =>
      item.id === id ? { ...item, page: newPage } : item
    );
    setNames(updatedNames);
    setFiltered(
      updatedNames.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const nameDocRef = doc(db, "books", bookDoc.id, "names", id);
    await updateDoc(nameDocRef, { page: newPage });
  };

  const handleNameClick = (id, currentName) => {
    setEditingId(id);
    setEditingValue(currentName);
  };

  const handleNameChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleNameSave = async (id) => {
    const cleaned = editingValue.trim().replace(/[\r\n]+/g, " ");
    const updatedNames = names.map((item) =>
      item.id === id ? { ...item, name: cleaned } : item
    );
    setNames(updatedNames);
    setFiltered(
      updatedNames.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    const booksCol = collection(db, "books");
    const booksSnapshot = await getDocs(booksCol);
    const bookDoc = booksSnapshot.docs.find(
      (doc) => doc.data().name === bookName
    );
    if (!bookDoc) return;

    const nameDocRef = doc(db, "books", bookDoc.id, "names", id);
    await updateDoc(nameDocRef, { name: cleaned });

    setEditingId(null);
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

            {editingId === id ? (
              <input
                type="text"
                value={editingValue}
                onChange={handleNameChange}
                onBlur={() => handleNameSave(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave(id);
                }}
                style={{ flexGrow: 1, padding: "5px" }}
                autoFocus
              />
            ) : (
              <span
                style={{ flexGrow: 1, cursor: "pointer" }}
                onClick={() => handleNameClick(id, name)}
              >
                {name}
              </span>
            )}

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
