import { Grid, Image, Pointer, Type, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ButtonWidget from './ButtonWidget';
import ImageWidget from './ImageWidget';
import TableWidget from './TableWidget';
import TextWidget from './TextWidget';

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
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setIsDraggingNew(false);
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

      {/* Sidebar - Only apply transition to transform property */}
      <div 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed sm:relative sm:translate-x-0
          w-64 h-screen bg-white shadow z-40
          overflow-y-auto
        `}
        style={{
          transition: 'transform 0.3s ease-in-out'
        }}
      >
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
                style={{ touchAction: 'none' }}
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
            <span className="text-sm text-gray-500 hidden sm:inline">(Double click to edit the widgets)</span>
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
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', ''); 
                  const canvas = document.createElement('canvas');
                  canvas.width = 1;
                  canvas.height = 1;
                  e.dataTransfer.setDragImage(canvas, 0, 0);
                  handleDragStart(e, widget);
                }}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, widget)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  position: 'absolute',
                  left: `${widget.position.x}%`,
                  top: `${widget.position.y}%`,
                  transform: 'none',
                  transition: 'none'
                }}
                className="group cursor-move"
              >
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 z-10"
                  style={{ transition: 'opacity 0.2s' }}
                >
                  <X className="h-3 w-3" />
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