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
                        onDoubleClick={() => {
                          const newValue = prompt('Edit cell:', cell);
                          if (newValue !== null) {
                            const newContent = [...content];
                            newContent[rowIndex][cellIndex] = newValue;
                            onChange(newContent);
                          }
                        }}
                      >
                        {cell}
                      </div>
                      {cellIndex === row.length - 1 && (
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100"
                          title="Remove row"
                        >
                          ×
                        </button>
                      )}
                      {rowIndex === 0 && (
                        <button
                          onClick={() => removeColumn(cellIndex)}
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100"
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

  export default TableWidget;