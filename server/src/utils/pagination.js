const MAX_PAGE_SIZE = 100

export const parsePagination = (query, defaultPageSize = 20) => {
  const requestedPage = Number.parseInt(query.page, 10)
  const requestedPageSize = Number.parseInt(query.limit, 10)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
    ? Math.min(requestedPageSize, MAX_PAGE_SIZE)
    : defaultPageSize

  return {
    page,
    pageSize,
    from: (page - 1) * pageSize,
    to: page * pageSize - 1
  }
}

export const paginatedResponse = (data, pagination, total) => ({
  data,
  page: pagination.page,
  pageSize: pagination.pageSize,
  total: total || 0
})