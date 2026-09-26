const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const pageCount = Math.ceil(total / pageSize)

  if (pageCount <= 1) return null

  return (
    <nav className="mt-4 flex items-center justify-between gap-4" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600" aria-live="polite">
        Página {page} de {pageCount} · {total} registros
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </nav>
  )
}

export default Pagination
