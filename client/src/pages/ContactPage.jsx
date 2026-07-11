import { useState } from 'react'
import toast from 'react-hot-toast'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulación de envío (después se conectará con backend)
    toast.success('📩 Mensaje enviado. Te contactaremos pronto.', {
      duration: 3000,
      icon: '✅'
    })
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📬 <span className="text-primary">Contacto</span>
        </h1>
        <p className="text-gray-600 text-lg">
          ¿Consultas, pedidos o sugerencias? Escribinos y te responderemos a la brevedad.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tumail@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Mensaje</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Escribí tu mensaje..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-emerald-600 transition font-semibold"
          >
            Enviar mensaje
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-600">
          <p className="mb-2">📞 También podés contactarnos por WhatsApp</p>
          <a
            href="https://wa.me/5491123456789?text=Hola%20CheVaper,%20quiero%20consultar%20sobre%20productos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <span>📱</span> Escribinos al +54 9 11 2345-6789
          </a>
        </div>
      </div>
    </div>
  )
}

export default ContactPage