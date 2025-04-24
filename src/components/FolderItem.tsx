import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Download, FolderClosed, MoreHorizontal, Share } from "lucide-react"
import Link from "next/link"
import { OdFolderChildren } from "../types"

interface FolderItemProps {
  folder: OdFolderChildren
  path: string
  viewMode: "grid" | "list"
  onDownload?: () => void
  onShare?: () => void
}

export function FolderItem({ folder, path, viewMode, onDownload, onShare }: FolderItemProps) {
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
            <p className="text-sm text-zinc-400">{itemCount} 个项目</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">更多选项</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 text-zinc-200">
            <DropdownMenuItem 
              className="hover:bg-zinc-800 hover:text-white"
              onClick={onShare}
            >
              <Share className="mr-2 h-4 w-4" />
              分享
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-zinc-800 hover:text-white"
              onClick={onDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              下载
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
