import { useEffect } from "react";

const TableWidget = ({ content, onChange }) => {
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

    window.addEventListener('keydown', handleKeyDown);
    
    // Set initial prompt timer
    const promptTimer = setTimeout(() => {
      tableCommandPrompt();
    }, 500);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(promptTimer);
    };
  }, [content]);

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
    <div className="relative" onDoubleClick={tableCommandPrompt}>
      <table className="w-full text-sm text-left border-collapse">
        <tbody>
          {content.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {row.map((cell, cellIndex) => (
                <td 
                  key={`${rowIndex}-${cellIndex}`} 
                  className="px-4 py-2 border"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleCellEdit(rowIndex, cellIndex, e);
                  }}
                >
                  {cell || " "}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWidget;