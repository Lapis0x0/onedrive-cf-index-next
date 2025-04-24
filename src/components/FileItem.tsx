import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Download, FileText, MoreHorizontal, Share } from "lucide-react"
import Link from "next/link"
import { OdFileObject } from "../types"
import { getFileIcon } from "../utils/getFileIcon"

interface FileItemProps {
  file: OdFileObject
  path: string
  viewMode: "grid" | "list"
  onDownload?: () => void
  onShare?: () => void
}

export function FileItem({ file, path, viewMode, onDownload, onShare }: FileItemProps) {
  const getFileIconComponent = (type: string) => {
    // 使用原有的文件图标逻辑
    const icon = getFileIcon(file.name, { video: Boolean(file.video) })
    return <FileText className="h-5 w-5 text-red-500" />
  }

  // 构建文件链接
  const fileHref = `${path === '/' ? '' : path}/${encodeURIComponent(file.name)}`

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700">
        <Link href={fileHref} className="flex items-center gap-3 hover:text-red-500">
          {getFileIconComponent(file.name)}
          <div>
            <div className="font-medium text-white">{file.name}</div>
            <div className="text-sm text-zinc-400">
              {file.size} • {new Date(file.lastModifiedDateTime).toLocaleDateString()}
            </div>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-md border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700">
      <Link href={fileHref} className="flex items-center gap-2 hover:text-red-500">
        {getFileIconComponent(file.name)}
        <div className="font-medium text-white truncate">{file.name}</div>
      </Link>
      <div className="mt-2 text-sm text-zinc-400">
        {file.size} • {new Date(file.lastModifiedDateTime).toLocaleDateString()}
      </div>
    </div>
  )
}
