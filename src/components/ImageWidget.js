const ImageWidget = ({ content, onChange }) => {
  const handleSizeChange = (e) => {
    e.stopPropagation();
    
    const width = prompt("Enter width (px):", content.width);
    const height = prompt("Enter height (px):", content.height);
  
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      onChange({
        ...content,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      });
    } else {
      alert("Please enter valid positive numbers for width and height.");
    }
  };
  

  const handleUrlChange = (e) => {
    e.stopPropagation();
    const newUrl = prompt("Enter image URL:", content.url);
    if (newUrl) {
      onChange({
        ...content,
        url: newUrl,
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="relative group">
        <img
          src={content.url}
          alt="Widget"
          style={{
            width: `${content.width}px`,
            height: `${content.height}px`,
            objectFit: "cover",
          }}
          className="max-w-full h-auto"
          onDoubleClick={handleUrlChange}
        />
        <button
          onClick={handleSizeChange}
          className="absolute bottom-2 right-2 px-2 py-1 bg-blue-500 text-white rounded text-sm opacity-0 group-hover:opacity-100"
        >
          Resize
        </button>
      </div>
    </div>
  );
};

export default ImageWidget;
