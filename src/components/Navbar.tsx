import Link from 'next/link'
import { FileText, Search } from 'lucide-react'
import { useState } from 'react'
import siteConfig from '../../config/site.config'
import SearchModal from './SearchModal'
import { useHotkeys } from 'react-hotkeys-hook'
import useDeviceOS from '../utils/useDeviceOS'

const Navbar = () => {
  const os = useDeviceOS()
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearchBox = () => setSearchOpen(true)

  // 支持键盘快捷键搜索
  useHotkeys(`${os === 'mac' ? 'meta' : 'ctrl'}+k`, e => {
    openSearchBox()
    e.preventDefault()
  })

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <SearchModal searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
      
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold text-white">{siteConfig.title || '文件库'}</span>
        </Link>
        
        <button 
          className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-4 py-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          onClick={openSearchBox}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">搜索...</span>
          <div className="hidden md:flex items-center gap-1">
            <div className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
              {os === 'mac' ? '⌘' : 'Ctrl'}
            </div>
            <div className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
              K
            </div>
          </div>
        </button>
      </div>
    </header>
  )
}

export default Navbar
