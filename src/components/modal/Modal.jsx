import { useState } from "react";
import "./modal.scss";

function Modal({ isOpen, onClose, onSubmit, title, placeholder }) {
  const [value, setValue] = useState("");
  if (!isOpen) return null;

  const handleSubmit = () => {
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
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="actions">
          <button onClick={handleSubmit}>Додати</button>
          <button onClick={onClose}>Закрити</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
