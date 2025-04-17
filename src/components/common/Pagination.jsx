import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page or none
  if (totalPages <= 1) return null;
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Maximum of 7 page buttons (including ellipses)
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // If current page is among first 3 pages
      if (currentPage <= 3) {
        pages.push(2, 3, 4, '...', totalPages);
      }
      // If current page is among last 3 pages
      else if (currentPage >= totalPages - 2) {
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      }
      // If current page is in the middle
      else {
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center space-x-1">
      {/* Previous button */}
      <button
        className={`px-3 py-1 rounded-md ${
          currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <FaChevronLeft size={14} />
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-1">...</span>
          ) : (
            <button
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Next button */}
      <button
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;