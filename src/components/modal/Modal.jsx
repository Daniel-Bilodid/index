import { useState, useRef, useEffect } from "react";
import "./modal.scss";

function Modal({ isOpen, onClose, onSubmit, title, placeholder }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue("");
      onClose();
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              const cleaned = e.target.value
                .replace(/[\u000B\u2028\u2029\r\n]/g, "")
                .replace(/\u00A0/g, " ");
              setValue(cleaned);
            }}
          />
          <div className="actions">
            <button type="submit">Додати</button>
            <button type="button" onClick={onClose}>
              Закрити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
