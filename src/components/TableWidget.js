import { X } from "lucide-react";

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
      <div className="overflow-visible pt-8 pr-8">
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            {content.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="group/row"
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className={`
                      border border-gray-300 p-2 relative
                      group/cell
                      ${rowIndex === 0 ? 'group/header' : ''}
                    `}
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
                        className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover/row:opacity-100 transition-opacity"
                        title="Remove row"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {rowIndex === 0 && (
                      <button
                        onClick={() => removeColumn(cellIndex)}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover/cell:opacity-100 group-hover/header:opacity-100 transition-opacity"
                        title="Remove column"
                      >
                        <X className="h-3 w-3" />
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

export default TableWidget;