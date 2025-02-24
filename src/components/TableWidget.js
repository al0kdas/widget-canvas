import { useEffect, useState } from "react";

const TableWidget = ({ content, onChange }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, rowIndex: null, cellIndex: null });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+R to add row
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        addRowViaPrompt();
      }
      // Ctrl+C to add column
      else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        addColumnViaPrompt();
      }
      // Ctrl+X to remove row
      else if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        removeRowViaPrompt();
      }
      // Ctrl+Z to remove column
      else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        removeColumnViaPrompt();
      }
      // Ctrl+P to open table command prompt
      else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        tableCommandPrompt();
      }
    };

    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [content, contextMenu]);

  const tableCommandPrompt = () => {
    const command = prompt(
      "Table Commands:\n" +
      "add row - Add a new row\n" +
      "add column - Add a new column\n" +
      "delete row [number] - Delete a specific row\n" +
      "delete column [number] - Delete a specific column\n" +
      "(Press Esc to cancel)"
    );
    
    if (!command) return;
    
    const lowerCommand = command.toLowerCase().trim();
    
    if (lowerCommand === "add row") {
      addRowViaPrompt();
    } 
    else if (lowerCommand === "add column") {
      addColumnViaPrompt();
    } 
    else if (lowerCommand.startsWith("delete row")) {
      const parts = lowerCommand.split(" ");
      const rowNum = parseInt(parts[2]);
      if (!isNaN(rowNum) && rowNum > 0 && rowNum <= content.length) {
        removeSpecificRow(rowNum - 1);
      } else {
        removeRowViaPrompt();
      }
    } 
    else if (lowerCommand.startsWith("delete column")) {
      const parts = lowerCommand.split(" ");
      const colNum = parseInt(parts[2]);
      if (!isNaN(colNum) && colNum > 0 && colNum <= content[0].length) {
        removeSpecificColumn(colNum - 1);
      } else {
        removeColumnViaPrompt();
      }
    }
  };

  const addRowViaPrompt = () => {
    const confirm = window.confirm("Add a new row?");
    if (confirm) {
      const newRow = Array(content[0].length).fill('');
      onChange([...content, newRow]);
    }
  };

  const addColumnViaPrompt = () => {
    const confirm = window.confirm("Add a new column?");
    if (confirm) {
      onChange(content.map(row => [...row, '']));
    }
  };

  const removeSpecificRow = (rowIndex) => {
    if (content.length <= 1) {
      alert("Cannot remove the last row!");
      return;
    }
    
    const confirm = window.confirm(`Remove row ${rowIndex + 1}?`);
    if (confirm) {
      const newContent = content.filter((_, index) => index !== rowIndex);
      onChange(newContent);
    }
  };

  const removeRowViaPrompt = () => {
    if (content.length <= 1) {
      alert("Cannot remove the last row!");
      return;
    }
    
    const rowIndex = parseInt(prompt("Enter row number to remove (1-" + content.length + "):")) - 1;
    
    if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= content.length) {
      alert("Invalid row number!");
      return;
    }
    
    removeSpecificRow(rowIndex);
  };

  const removeSpecificColumn = (colIndex) => {
    if (content[0].length <= 1) {
      alert("Cannot remove the last column!");
      return;
    }
    
    const confirm = window.confirm(`Remove column ${colIndex + 1}?`);
    if (confirm) {
      const newContent = content.map(row => row.filter((_, index) => index !== colIndex));
      onChange(newContent);
    }
  };

  const removeColumnViaPrompt = () => {
    if (content[0].length <= 1) {
      alert("Cannot remove the last column!");
      return;
    }
    
    const colIndex = parseInt(prompt("Enter column number to remove (1-" + content[0].length + "):")) - 1;
    
    if (isNaN(colIndex) || colIndex < 0 || colIndex >= content[0].length) {
      alert("Invalid column number!");
      return;
    }
    
    removeSpecificColumn(colIndex);
  };

  const handleCellEdit = (rowIndex, cellIndex) => {
    const newValue = prompt('Edit cell:', content[rowIndex][cellIndex]);
    if (newValue !== null) {
      const newContent = [...content];
      newContent[rowIndex][cellIndex] = newValue;
      onChange(newContent);
    }
  };

  const handleCellContextMenu = (e, rowIndex, cellIndex) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      rowIndex,
      cellIndex
    });
  };

  const showCellOptionsMenu = (e, rowIndex, cellIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Position context menu at mouse position
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      rowIndex,
      cellIndex
    });
  };

  return (
    <div className="relative">
      <table className="w-full text-sm text-left border-collapse">
        <tbody>
          {content.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {row.map((cell, cellIndex) => (
                <td 
                  key={`${rowIndex}-${cellIndex}`} 
                  className="px-4 py-2 border"
                  onDoubleClick={(e) => showCellOptionsMenu(e, rowIndex, cellIndex)}
                  onContextMenu={(e) => handleCellContextMenu(e, rowIndex, cellIndex)}
                >
                  {cell || " "}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="absolute bg-white border shadow-lg rounded-md z-50 w-48"
          style={{ 
            top: `0px`, 
            left: `0px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-1">
            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleCellEdit(contextMenu.rowIndex, contextMenu.cellIndex);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Edit Cell
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addRowViaPrompt();
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Add Row
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                removeSpecificRow(contextMenu.rowIndex);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete Row
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addColumnViaPrompt();
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Add Column
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                removeSpecificColumn(contextMenu.cellIndex);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete Column
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TableWidget;