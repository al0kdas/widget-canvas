import { Grid, Image, Pointer, Type } from 'lucide-react';
import { useEffect, useState } from 'react';
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
          url: '/api/placeholder/400/320',
          width: 400,
          height: 320
        };
      default:
        return '';
    }
  };

  const handleDragStart = (e, item, isNew = false) => {
    setIsDraggingNew(isNew);
    
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
      // Calculate offset from mouse position to widget's top-left corner
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      if (e.target.classList) {
        e.target.classList.add('opacity-50');
      }
    }
  };

  const handleDragEnd = (e) => {
    if (e.target.classList) {
      e.target.classList.remove('opacity-50');
    }
    setDraggedItem(null);
    setIsDraggingNew(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    // Calculate position as percentage of canvas size
    const x = ((e.clientX - canvasRect.left - (isDraggingNew ? 0 : dragOffset.x)) / canvasRect.width) * 100;
    const y = ((e.clientY - canvasRect.top - (isDraggingNew ? 0 : dragOffset.y)) / canvasRect.height) * 100;

    if (isDraggingNew) {
      const newWidget = {
        ...draggedItem,
        position: { x, y }
      };
      setWidgets([...widgets, newWidget]);
    } else {
      setWidgets(widgets.map(widget =>
        widget.id === draggedItem.id
          ? { ...widget, position: { x, y } }
          : widget
      ));
    }
    
    setDraggedItem(null);
    setIsDraggingNew(false);
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
            className="relative h-[calc(100vh-8rem)] bg-white rounded shadow overflow-auto"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
                onDragEnd={handleDragEnd}
                className="absolute group cursor-move"
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