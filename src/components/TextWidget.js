import { useState } from "react";

const TextWidget = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(text);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditing) return; // Don't show prompt if already editing in input field
    
    const newText = prompt('Enter new text:', content);
    if (newText !== null) {
      setText(newText);
      onChange(newText);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div
      className="p-6 bg-white rounded shadow"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
          autoFocus
        />
      ) : (
        <div 
          onClick={handleClick}
          className="w-full p-2 cursor-text"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default TextWidget;