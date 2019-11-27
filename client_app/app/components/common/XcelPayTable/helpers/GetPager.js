import range from 'lodash/range';

const getPager = (totalItems = 0, currentPage = 1, pageSize = 10) => {
  const totalPages = (totalItems && totalItems > 0) ? Math.ceil(totalItems / pageSize) : 1;
  let startPage;
  let endPage;
  if (totalPages <= 10) {
    startPage = 1;
    endPage = totalPages;
  } else if (currentPage <= 6) {
    startPage = 1;
    endPage = 10;
  } else if (currentPage + 4 >= totalPages) {
    startPage = totalPages - 9;
    endPage = totalPages;
  } else {
    startPage = currentPage - 5;
    endPage = currentPage + 4;
  }
  // calculate start and end item indexes
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = (totalItems > 0) ? Math.min(startIndex + (pageSize - 1), totalItems - 1) : 1;
  const pages = range(startPage, endPage + 1);
  // return object with all pager properties required by the view
  return {
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    startPage,
    endPage,
    startIndex,
    endIndex,
    pages,
  };
};

export default getPager;
