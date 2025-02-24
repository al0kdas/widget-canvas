const { useState } = require("react");

const TextWidget = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(text);
  };

  return (
    <div 
      className="p-4 bg-white rounded shadow"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
          autoFocus
        />
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
};

  export default TextWidget;