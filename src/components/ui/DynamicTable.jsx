import React, { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaAngleLeft,
  FaAngleRight,
  FaTrash,
} from "react-icons/fa6";

// Table Component
const DynamicTable = ({
  columns,
  data,
  onDelete,
  onRowClick,
  paginate = true,
  rowsPerPage = 7,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle range of pages to show
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#333] text-white">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left font-semibold text-sm cursor-pointer"
                  onClick={() => handleSort(col.accessor)}
                >
                  {col.header}
                  {sortConfig.key === col.accessor && (
                    <span className={`ml-2`}>
                      {sortConfig.direction === "asc" ? (
                        <FaArrowUp className="inline" />
                      ) : (
                        <FaArrowDown className="inline" />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row.id.replace("#", ""))}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm">
                    {col.accessor === "order_status" ? (
                      <div
                        className={`p-3 rounded-lg ${
                          row[col.accessor] === "Pending"
                            ? "bg-gray-500 text-white"
                            : row[col.accessor] === "Processing"
                            ? "bg-yellow-500 text-white"
                            : row[col.accessor] === "Ready"
                            ? "bg-green-700 text-white"
                            : row[col.accessor] === "Completed"
                            ? "bg-[#333] text-white"
                            : row[col.accessor] === "Canceled"
                            ? "bg-red-500 text-white"
                            : ""
                        }`}
                      >
                        <span className="font-semibold text-center w-full block">
                          {row[col.accessor]}
                        </span>
                      </div>
                    ) : col.accessor === "actions" ? (
                      <button
                        onClick={(e) => {e.stopPropagation(); onDelete(row.id.replace("#", ""))}}
                        className="text-[#333] hover:text-red-800"
                      >
                        <FaTrash size={16} />
                      </button>
                    ) : (
                      row[col.accessor] || "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginate && (
        <div className="flex justify-between items-center p-3 px-4 bg-white mt-10 rounded-md">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-2 hover:bg-gray-200 text-gray-700 rounded"
          >
            <FaAngleLeft />
          </button>
          <div className="flex space-x-2">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-4 py-2 text-gray-700 rounded ${
                  pageNumber === currentPage ? "bg-[#333] text-white" : ""
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-2 hover:bg-gray-200 text-gray-700 rounded"
          >
            <FaAngleRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
