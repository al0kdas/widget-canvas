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
        return 'https://getuikit.com/v2/docs/images/placeholder_600x400.svg';
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
        content: getDefaultContent(item.type)
      };
      setDraggedItem(newWidget);
    } else {
      setDraggedItem(item);
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

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newWidgets = [...widgets];

    if (isDraggingNew) {
      newWidgets.splice(index, 0, draggedItem);
    } else {
      const oldIndex = widgets.findIndex(w => w.id === draggedItem.id);
      if (oldIndex === index) return;
      
      newWidgets.splice(oldIndex, 1);
      newWidgets.splice(index, 0, draggedItem);
    }
    
    setWidgets(newWidgets);
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white p-4 shadow">
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

      <div className="flex-1 p-8">
        <div className='flex items-baseline'>
          <h2 className="text-lg font-semibold mb-4 mr-1">Canvas</h2>
          <span className="text-sm text-gray-500"> (Double click to edit widgets)</span>
        </div>
        <div className="min-h-[500px] bg-white p-6 rounded shadow">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative mb-4 group"
            >
              <button
                onClick={() => removeWidget(widget.id)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
              {renderWidget(widget)}
            </div>
          ))}
          <div 
            className="h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, widgets.length)}
          >
             <span className='text-sm text-gray-500'>Drop widgets here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetEditor;