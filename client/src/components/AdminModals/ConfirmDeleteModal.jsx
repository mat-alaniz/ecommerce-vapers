const ConfirmDeleteModal = ({ modal, onClose }) => {
  const handleDelete = async () => {
    if (modal.onConfirm) {
      await modal.onConfirm(modal.itemId, modal.itemName)
    }
    onClose()
  }

  if (!modal.isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <h3 className="text-xl font-semibold text-red-700">{modal.title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700">{modal.message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
