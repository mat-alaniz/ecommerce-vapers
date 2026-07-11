const AdminTabs = ({ activeTab, onTabChange, ordersCount, usersCount, productsCount }) => {
  const tabs = [
    { id: 'panel', label: '📊 Panel' },
    { id: 'ordenes', label: `🛒 Órdenes (${ordersCount})` },
    { id: 'usuarios', label: `👥 Usuarios (${usersCount})` },
    { id: 'stock', label: `📦 Stock (${productsCount})` }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium transition ${
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default AdminTabs
