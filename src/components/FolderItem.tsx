import { Button } from "./ui/button"
import { Download, FolderClosed } from "lucide-react"
import Link from "next/link"
import { OdFolderChildren } from "../types"

interface FolderItemProps {
  folder: OdFolderChildren
  path: string
  viewMode: "grid" | "list"
  onDownload: () => void
}

export function FolderItem({ folder, path, viewMode, onDownload }: FolderItemProps) {
  // 构建文件夹链接
  const folderHref = `${path === '/' ? '' : path}/${encodeURIComponent(folder.name)}`
  
  // 计算文件夹中的项目数量
  const itemCount = folder.folder?.childCount || 0

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700">
        <Link href={folderHref} className="flex items-center gap-3 hover:text-red-500">
          <FolderClosed className="h-5 w-5 text-red-500" />
          <div>
            <div className="font-medium text-white">{folder.name}</div>
            <div className="text-sm text-zinc-400">{itemCount} 个项目</div>
          </div>
        </Link>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-400 hover:text-white"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">下载</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-md border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700">
      <Link href={folderHref} className="flex items-center gap-2 hover:text-red-500">
        <FolderClosed className="h-5 w-5 text-red-500" />
        <div className="font-medium text-white">{folder.name}</div>
      </Link>
      <div className="mt-2 text-sm text-zinc-400">{itemCount} 个项目</div>
    </div>
  )
}
