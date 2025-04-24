import { Button } from "./ui/button"
import { Download, FileText, Check } from "lucide-react"
import Link from "next/link"
import { OdFileObject } from "../types"
import { getFileIcon } from "../utils/getFileIcon"
import { humanFileSize } from "../utils/fileDetails"

interface FileItemProps {
  file: OdFileObject
  path: string
  viewMode: "grid" | "list"
  onDownload: () => void
  isSelected?: boolean
  onSelect?: () => void
}

export function FileItem({ file, path, viewMode, onDownload, isSelected = false, onSelect }: FileItemProps) {
  const getFileIconComponent = (type: string) => {
    // 使用原有的文件图标逻辑
    const icon = getFileIcon(file.name, { video: Boolean(file.video) })
    return <FileText className="h-5 w-5 text-red-500" />
  }

  // 构建文件链接
  const fileHref = `${path === '/' ? '' : path}/${encodeURIComponent(file.name)}`

  if (viewMode === "list") {
    return (
      <div 
        className={`flex items-center justify-between rounded-md border ${
          isSelected 
            ? "border-red-500 bg-zinc-800" 
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        } p-3`}
      >
        <div className="flex items-center gap-3">
          <button 
            className={`flex h-5 w-5 items-center justify-center rounded-sm ${
              isSelected 
                ? "bg-red-500 text-white" 
                : "border border-zinc-700 bg-zinc-800 text-transparent hover:border-zinc-600"
            }`}
            onClick={onSelect}
          >
            <Check className="h-3 w-3" />
          </button>
          <Link href={fileHref} className="flex items-center gap-3 hover:text-red-500">
            {getFileIconComponent(file.name)}
            <div>
              <div className="font-medium text-white">{file.name}</div>
              <div className="text-sm text-zinc-400">
                {humanFileSize(file.size)} • {new Date(file.lastModifiedDateTime).toLocaleDateString()}
              </div>
            </div>
          </Link>
        </div>
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
    <div 
      className={`relative flex flex-col rounded-md border ${
        isSelected 
          ? "border-red-500 bg-zinc-800" 
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      } p-4`}
    >
      <button 
        className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm ${
          isSelected 
            ? "bg-red-500 text-white" 
            : "border border-zinc-700 bg-zinc-800 text-transparent hover:border-zinc-600"
        }`}
        onClick={onSelect}
      >
        <Check className="h-3 w-3" />
      </button>
      <Link href={fileHref} className="flex items-center gap-2 hover:text-red-500">
        {getFileIconComponent(file.name)}
        <div className="font-medium text-white truncate">{file.name}</div>
      </Link>
      <div className="mt-2 text-sm text-zinc-400">
        {humanFileSize(file.size)} • {new Date(file.lastModifiedDateTime).toLocaleDateString()}
      </div>
    </div>
  )
}
