const DEVELOPER_NAME = 'Matias Jesus Alaniz'
const DEVELOPER_WHATSAPP = '5491168011430'
const WHATSAPP_MESSAGE = 'Hola, vi la tienda CheVaper y me interesa desarrollar un proyecto similar.'

const whatsappUrl = `https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-sm">
      <p>© {new Date().getFullYear()} CheVaper. Todos los derechos reservados.</p>
      <p>
        Desarrollado por <span className="font-semibold text-white">{DEVELOPER_NAME}</span>
        {' · '}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 hover:underline transition"
        >
          ¿Querés una tienda como esta? Hablemos
        </a>
      </p>
    </div>
  </footer>
)

export default Footer
