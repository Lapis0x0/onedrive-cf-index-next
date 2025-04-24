import { useState } from "react"
import { Grid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { FileItem } from "./FileItem"
import { FolderItem } from "./FolderItem"
import Breadcrumb from "./Breadcrumb"
import { OdFileObject, OdFolderObject } from "../types"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"

interface FileExplorerProps {
  query: ParsedUrlQuery
  folderChildren: Array<OdFileObject | OdFolderObject>
  path: string
  selected: { [key: string]: boolean }
  toggleItemSelected: (id: string) => void
  totalSelected: number
  toggleTotalSelected: () => void
  totalGenerating: boolean
  handleSelectedDownload: () => void
  folderGenerating: { [key: string]: boolean }
  handleFolderDownload: (id: string, name?: string) => void
}

export function FileExplorer({
  query,
  folderChildren,
  path,
  selected,
  toggleItemSelected,
  totalSelected,
  toggleTotalSelected,
  totalGenerating,
  handleSelectedDownload,
  folderGenerating,
  handleFolderDownload
}: FileExplorerProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("name")

  // 分离文件夹和文件
  const folders = folderChildren.filter(item => 'folder' in item) as OdFolderObject[]
  const files = folderChildren.filter(item => 'file' in item) as OdFileObject[]

  // 排序逻辑
  const sortItems = (items: any[], type: "folder" | "file") => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "date":
          return new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime()
        case "size":
          if (type === "folder") {
            return (b.folder?.childCount || 0) - (a.folder?.childCount || 0)
          } else {
            return b.size - a.size
          }
        case "type":
          if (type === "folder") return -1
          const extA = a.name.split('.').pop() || ""
          const extB = b.name.split('.').pop() || ""
          return extA.localeCompare(extB)
        default:
          return 0
      }
    })
  }

  const sortedFolders = sortItems(folders, "folder")
  const sortedFiles = sortItems(files, "file")

  return (
    <div className="space-y-6">
      <Breadcrumb query={query} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">文件</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-zinc-800 bg-zinc-900">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none border-r border-zinc-800 ${viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">列表视图</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400"}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">网格视图</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">排序</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 text-zinc-200">
              <DropdownMenuItem 
                className={`hover:bg-zinc-800 hover:text-white ${sortBy === "name" ? "text-red-500" : ""}`}
                onClick={() => setSortBy("name")}
              >
                名称
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`hover:bg-zinc-800 hover:text-white ${sortBy === "date" ? "text-red-500" : ""}`}
                onClick={() => setSortBy("date")}
              >
                日期
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`hover:bg-zinc-800 hover:text-white ${sortBy === "size" ? "text-red-500" : ""}`}
                onClick={() => setSortBy("size")}
              >
                大小
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`hover:bg-zinc-800 hover:text-white ${sortBy === "type" ? "text-red-500" : ""}`}
                onClick={() => setSortBy("type")}
              >
                类型
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        {sortedFolders.length > 0 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" : "space-y-2"}>
            {sortedFolders.map((folder) => (
              <FolderItem 
                key={folder.id} 
                folder={folder} 
                path={path}
                viewMode={viewMode}
                onDownload={() => handleFolderDownload(folder.id, folder.name)}
              />
            ))}
          </div>
        )}

        {sortedFiles.length > 0 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" : "space-y-2"}>
            {sortedFiles.map((file) => (
              <FileItem 
                key={file.id} 
                file={file} 
                path={path}
                viewMode={viewMode}
                onDownload={() => toggleItemSelected(file.id)}
              />
            ))}
          </div>
        )}

        {sortedFolders.length === 0 && sortedFiles.length === 0 && (
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">该文件夹为空</p>
          </div>
        )}
      </div>
    </div>
  )
}
