const ImageWidget = ({ content, onChange }) => (
    <div className="p-4 bg-white rounded shadow">
      <img 
        src={content} 
        alt="Widget" 
        className="max-w-full h-auto"
        onDoubleClick={() => {
          const newUrl = prompt('Enter image URL:', content);
          if (newUrl) onChange(newUrl);
        }}
      />
    </div>
  );

  export default ImageWidget;