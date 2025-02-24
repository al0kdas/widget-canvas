// WidgetEditor.jsx
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
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const widgetRefs = useRef({});
  const [widgetSizes, setWidgetSizes] = useState({});

  useEffect(() => {
    localStorage.setItem('widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    const updateWidgetSizes = () => {
      const sizes = {};
      Object.entries(widgetRefs.current).forEach(([id, element]) => {
        if (element) {
          sizes[id] = {
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        }
      });
      setWidgetSizes(sizes);
    };

    updateWidgetSizes();
    window.addEventListener('resize', updateWidgetSizes);
    return () => window.removeEventListener('resize', updateWidgetSizes);
  }, [widgets]);

  const availableWidgets = [
    { id: 'text', type: 'Text', icon: Type },
    { id: 'button', type: 'Button', icon: Pointer },
    { id: 'table', type: 'Table', icon: Grid },
    { id: 'image', type: 'Image', icon: Image },
  ];

  const isOverlapping = (pos1, size1, pos2, size2) => {
    const rect1 = {
      left: pos1.x,
      right: pos1.x + size1.width,
      top: pos1.y,
      bottom: pos1.y + size1.height
    };

    const rect2 = {
      left: pos2.x,
      right: pos2.x + size2.width,
      top: pos2.y,
      bottom: pos2.y + size2.height
    };

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  const findNonOverlappingPosition = (initialX, initialY, widgetId) => {
    if (!canvasRef.current) return { x: initialX, y: initialY };

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentSize = widgetSizes[widgetId] || { width: 100, height: 100 };
    
    const pxX = (initialX / 100) * canvasRect.width;
    const pxY = (initialY / 100) * canvasRect.height;

    let x = pxX;
    let y = pxY;
    const step = 20;
    const maxAttempts = 100;
    let attempt = 0;
    let spiral = 1;

    while (attempt < maxAttempts) {
      let hasOverlap = false;

      for (const widget of widgets) {
        if (widget.id === widgetId) continue;

        const otherSize = widgetSizes[widget.id] || { width: 100, height: 100 };
        const otherPxPos = {
          x: (widget.position.x / 100) * canvasRect.width,
          y: (widget.position.y / 100) * canvasRect.height
        };

        if (isOverlapping(
          { x, y },
          currentSize,
          otherPxPos,
          otherSize
        )) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        return {
          x: (x / canvasRect.width) * 100,
          y: (y / canvasRect.height) * 100
        };
      }

      attempt++;
      spiral = Math.floor((attempt + 1) / 4) + 1;
      
      switch (attempt % 4) {
        case 0: x = pxX + (step * spiral); break;
        case 1: y = pxY + (step * spiral); break;
        case 2: x = pxX - (step * spiral); break;
        case 3: y = pxY - (step * spiral); break;
      }

      x = Math.max(0, Math.min(x, canvasRect.width - currentSize.width));
      y = Math.max(0, Math.min(y, canvasRect.height - currentSize.height));
    }

    return { x: initialX, y: initialY };
  };

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

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    let x = ((e.clientX - canvasRect.left + scrollLeft - (isDraggingNew ? 0 : dragOffset.x)) / canvasRect.width) * 100;
    let y = ((e.clientY - canvasRect.top + scrollTop - (isDraggingNew ? 0 : dragOffset.y)) / canvasRect.height) * 100;

    const newPosition = findNonOverlappingPosition(x, y, draggedItem.id);

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

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    let x = ((e.clientX - canvasRect.left + scrollLeft - (isDraggingNew ? 0 : dragOffset.x)) / canvasRect.width) * 100;
    let y = ((e.clientY - canvasRect.top + scrollTop - (isDraggingNew ? 0 : dragOffset.y)) / canvasRect.height) * 100;

    const position = findNonOverlappingPosition(x, y, draggedItem.id);

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
      <button
        className="sm:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '×' : '☰'}
      </button>

      <div 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed sm:relative sm:translate-x-0
          w-64 h-screen bg-white shadow z-40
          transition-transform duration-300 ease-in-out
        `}
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
                className="flex items-center p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100"
              >
                <widget.icon className="w-5 h-5 mr-2" />
                {widget.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 h-screen overflow-hidden">
        <div className="h-full p-4 sm:p-8">
          <div className="flex items-baseline mb-4">
            <h2 className="text-lg font-semibold mr-1">Canvas</h2>
            <span className="text-sm text-gray-500 hidden sm:inline">
              (Double click to edit the widgets)
            </span>
          </div>
          <div 
            ref={canvasRef}
            className="relative h-[calc(100vh-8rem)] bg-white rounded overflow-auto"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                ref={el => widgetRefs.current[widget.id] = el}
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
                style={{
                  position: 'absolute',
                  left: `${widget.position.x}%`,
                  top: `${widget.position.y}%`,
                  transform: 'none',
                  transition: 'none'
                }}
                className="group cursor-move border"
              >
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 z-10"
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
