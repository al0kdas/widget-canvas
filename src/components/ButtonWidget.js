const ButtonWidget = ({ content, onChange }) => (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onDoubleClick={() => {
        const newLabel = prompt('Enter button text:', content);
        if (newLabel) onChange(newLabel);
      }}
    >
      {content}
    </button>
  );
  
  export default ButtonWidget;