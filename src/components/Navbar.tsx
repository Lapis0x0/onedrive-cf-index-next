import Link from 'next/link'
import { FileText } from 'lucide-react'
import siteConfig from '../../config/site.config'

const Navbar = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold text-white">{siteConfig.title || '文件库'}</span>
        </Link>
      </div>
    </header>
  )
}

export default Navbar
