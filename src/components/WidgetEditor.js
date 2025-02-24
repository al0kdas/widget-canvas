import { Grid, Image, Pointer, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const WidgetEditor = () => {
  const savedWidgets = localStorage.getItem('widgets') || '[]';
  const [widgets, setWidgets] = useState(JSON.parse(savedWidgets));
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  
  const availableWidgets = [
    { id: 'text', type: 'Text', icon: Type },
    { id: 'button', type: 'Button', icon: Pointer },
    { id: 'table', type: 'Table', icon: Grid },
    { id: 'image', type: 'Image', icon: Image },
  ];
  
  useEffect(() => {
    localStorage.setItem('widgets', JSON.stringify(widgets));
  }, [widgets]);

  const getDefaultContent = (type) => {
    switch (type) {
      case 'Text':
        return 'Double click to edit text';
      case 'Button':
        return 'Button';
      case 'Table':
        return [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']];
      case 'Image':
        return {
          url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDH1lGoqxOJu9KNkdWgVZtoQ6CpnM5Y0A97N3zwyUJZDEk-YCLnBw-OLzpnvEmohupBgs&usqp=CAU',
          width: 100,
          height: 100
        };
      default:
        return '';
    }
  };

  const calculatePosition = (clientX, clientY, isNew = false) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const x = ((clientX - canvasRect.left + scrollLeft - (isNew ? 0 : dragOffset.x)) / canvasRect.width) * 100;
    const y = ((clientY - canvasRect.top + scrollTop - (isNew ? 0 : dragOffset.y)) / canvasRect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  const handleDragStart = (e, item, isNew = false) => {
    setIsDraggingNew(isNew);
    setIsDragging(true);
    
    if (isNew) {
      const newWidget = {
        id: `${item.id}-${Date.now()}`,
        type: item.type,
        content: getDefaultContent(item.type),
        position: { x: 0, y: 0 }
      };
      setDraggedItem(newWidget);
    } else {
      setDraggedItem(item);
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setCurrentPosition({
        x: item.position.x,
        y: item.position.y
      });
    }

    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setIsDraggingNew(false);
    document.body.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging || !draggedItem) return;

    const newPosition = calculatePosition(e.clientX, e.clientY, isDraggingNew);
    setCurrentPosition(newPosition);

    if (!isDraggingNew) {
      setWidgets(widgets.map(widget =>
        widget.id === draggedItem.id
          ? { ...widget, position: newPosition }
          : widget
      ));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const position = calculatePosition(e.clientX, e.clientY, isDraggingNew);

    if (isDraggingNew) {
      const newWidget = {
        ...draggedItem,
        position
      };
      setWidgets([...widgets, newWidget]);
    } else {
      setWidgets(widgets.map(widget =>
        widget.id === draggedItem.id
          ? { ...widget, position }
          : widget
      ));
    }
    
    handleDragEnd();
  };

  const handleTouchStart = (e, item, isNew = false) => {
    const touch = e.touches[0];
    handleDragStart({ clientX: touch.clientX, clientY: touch.clientY }, item, isNew);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleDragOver({ 
      preventDefault: () => {},
      clientX: touch.clientX, 
      clientY: touch.clientY 
    });
  };

  const handleTouchEnd = (e) => {
    if (!draggedItem) return;
    const touch = e.changedTouches[0];
    handleDrop({ 
      preventDefault: () => {},
      clientX: touch.clientX, 
      clientY: touch.clientY 
    });
  };

  const handleWidgetContentChange = (id, newContent) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, content: newContent } : widget
    ));
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };

  const ButtonWidget = ({ content, onChange }) => (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onDoubleClick={(e) => {
        e.stopPropagation();
        const newLabel = prompt('Enter button text:', content);
        if (newLabel) onChange(newLabel);
      }}
    >
      {content}
    </button>
  );

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
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
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

  const TableWidget = ({ content, onChange }) => {
    const addRow = () => {
      const newRow = Array(content[0].length).fill('');
      onChange([...content, newRow]);
    };

    const addColumn = () => {
      onChange(content.map(row => [...row, '']));
    };

    const removeRow = (rowIndex) => {
      if (content.length <= 1) return;
      const newContent = content.filter((_, index) => index !== rowIndex);
      onChange(newContent);
    };

    const removeColumn = (colIndex) => {
      if (content[0].length <= 1) return;
      const newContent = content.map(row => row.filter((_, index) => index !== colIndex));
      onChange(newContent);
    };

    const handleCellEdit = (rowIndex, cellIndex, e) => {
      e.stopPropagation();
      const newValue = prompt('Edit cell:', content[rowIndex][cellIndex]);
      if (newValue !== null) {
        const newContent = [...content];
        newContent[rowIndex][cellIndex] = newValue;
        onChange(newContent);
      }
    };

    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="mb-4 space-x-2">
          <button onClick={addRow} className="px-3 py-1 bg-blue-500 text-white rounded">
            Add Row
          </button>
          <button onClick={addColumn} className="px-3 py-1 bg-blue-500 text-white rounded">
            Add Column
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              {content.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex}
                      className="border border-gray-300 p-2 relative"
                    >
                      <div 
                        className="min-w-[100px] min-h-[30px]"
                        onDoubleClick={(e) => handleCellEdit(rowIndex, cellIndex, e)}
                      >
                        {cell}
                      </div>
                      {cellIndex === row.length - 1 && (
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove row"
                        >
                          ×
                        </button>
                      )}
                      {rowIndex === 0 && (
                        <button
                          onClick={() => removeColumn(cellIndex)}
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove column"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ImageWidget = ({ content, onChange }) => {
    const handleSizeChange = (e) => {
      e.stopPropagation();
      const width = prompt('Enter width (px):', content.width);
      const height = prompt('Enter height (px):', content.height);
      
      if (width && height) {
        onChange({
          ...content,
          width: parseInt(width),
          height: parseInt(height)
        });
      }
    };

    const handleUrlChange = (e) => {
      e.stopPropagation();
      const newUrl = prompt('Enter image URL:', content.url);
      if (newUrl) {
        onChange({
          ...content,
          url: newUrl
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
              objectFit: 'cover'
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

  const renderWidget = (widget) => {
    const props = {
      content: widget.content,
      onChange: (newContent) => handleWidgetContentChange(widget.id, newContent)
    };

    switch (widget.type) {
      case 'Text':
        return <TextWidget {...props} />;
      case 'Button':
        return <ButtonWidget {...props} />;
      case 'Table':
        return <TableWidget {...props} />;
      case 'Image':
        return <ImageWidget {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Toggle Button */}
      <button
        className="sm:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '×' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transform transition-transform duration-300 ease-in-out
        fixed sm:relative sm:translate-x-0
        w-64 h-screen bg-white shadow z-40
        overflow-y-auto
      `}>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Widgets</h2>
          <div className="space-y-2">
            {availableWidgets.map((widget) => (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget, true)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, widget, true)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex items-center p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100"
              >
                <widget.icon className="w-5 h-5 mr-2" />
                {widget.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-screen overflow-hidden">
        <div className="h-full p-4 sm:p-8">
          <div className="flex items-baseline mb-4">
            <h2 className="text-lg font-semibold mr-1">Canvas</h2>
            <span className="text-sm text-gray-500 hidden sm:inline">(Drag and drop widgets anywhere)</span>
          </div>
          <div 
            ref={canvasRef}
            className="relative h-[calc(100vh-8rem)] bg-white rounded shadow overflow-auto"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, widget)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`absolute group cursor-move transition-transform ${
                  isDragging && draggedItem?.id === widget.id ? 'z-50' : ''
                }`}
                style={{
                  left: `${widget.position.x}%`,
                  top: `${widget.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 z-10"
                >
                  ×
                </button>
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetEditor;