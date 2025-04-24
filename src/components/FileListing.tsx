import type { OdFileObject, OdFolderChildren, OdFolderObject } from '../types'
import { ParsedUrlQuery } from 'querystring'
import { FC, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import emojiRegex from 'emoji-regex'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import useLocalStorage from '../utils/useLocalStorage'
import { getPreviewType, preview } from '../utils/getPreviewType'
import { useProtectedSWRInfinite } from '../utils/fetchWithSWR'
import { getExtension, getRawExtension, getFileIcon } from '../utils/getFileIcon'
import { getStoredToken } from '../utils/protectedRouteHandler'
import {
  DownloadingToast,
  downloadMultipleFiles,
  downloadTreelikeMultipleFiles,
  traverseFolder,
} from './MultiFileDownloader'

import { layouts } from './SwitchLayout'
import Loading, { LoadingIcon } from './Loading'
import FourOhFour from './FourOhFour'
import Auth from './Auth'
import TextPreview from './previews/TextPreview'
import MarkdownPreview from './previews/MarkdownPreview'
import CodePreview from './previews/CodePreview'
import OfficePreview from './previews/OfficePreview'
import AudioPreview from './previews/AudioPreview'
import VideoPreview from './previews/VideoPreview'
import PDFPreview from './previews/PDFPreview'
import URLPreview from './previews/URLPreview'
import ImagePreview from './previews/ImagePreview'
import DefaultPreview from './previews/DefaultPreview'
import { PreviewContainer } from './previews/Containers'

// 新的文件浏览器组件
import { FileExplorer } from './FileExplorer'

// Disabling SSR for some previews
const EPUBPreview = dynamic(() => import('./previews/EPUBPreview'), {
  ssr: false,
})

/**
 * Convert url query into path string
 *
 * @param query Url query property
 * @returns Path string
 */
const queryToPath = (query?: ParsedUrlQuery) => {
  if (query) {
    const { path } = query
    if (!path) return '/'
    if (typeof path === 'string') return `/${encodeURIComponent(path)}`
    return `/${path.map(p => encodeURIComponent(p)).join('/')}`
  }
  return '/'
}

// Render the icon of a folder child (may be a file or a folder), use emoji if the name of the child contains emoji
const renderEmoji = (name: string) => {
  const emoji = emojiRegex().exec(name)
  return { render: emoji && !emoji.index, emoji }
}
const formatChildName = (name: string) => {
  const { render, emoji } = renderEmoji(name)
  return render ? name.replace(emoji ? emoji[0] : '', '').trim() : name
}
export const ChildName: FC<{ name: string; folder?: boolean }> = ({ name, folder }) => {
  const original = formatChildName(name)
  const extension = folder ? '' : getRawExtension(original)
  const prename = folder ? original : original.substring(0, original.length - extension.length)
  return (
    <span className="truncate before:float-right before:content-[attr(data-tail)]" data-tail={extension}>
      {prename}
    </span>
  )
}
export const ChildIcon: FC<{ child: OdFolderChildren }> = ({ child }) => {
  const { render, emoji } = renderEmoji(child.name)
  return render ? (
    <span>{emoji ? emoji[0] : '📁'}</span>
  ) : (
    <span className="icon">{child.file ? getFileIcon(child.name, { video: Boolean(child.video) }) : ['far', 'folder']}</span>
  )
}

export const Checkbox: FC<{
  checked: 0 | 1 | 2
  onChange: () => void
  title: string
  indeterminate?: boolean
}> = ({ checked, onChange, title, indeterminate }) => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.checked = Boolean(checked)
      if (indeterminate) {
        ref.current.indeterminate = checked == 1
      }
    }
  }, [ref, checked, indeterminate])

  const handleClick: MouseEventHandler = e => {
    if (ref.current) {
      if (e.target === ref.current) {
        e.stopPropagation()
      } else {
        ref.current.click()
      }
    }
  }

  return (
    <span
      title={title}
      className="inline-flex cursor-pointer items-center rounded p-1.5 hover:bg-gray-300/40 dark:hover:bg-gray-600/40"
      onClick={handleClick}
    >
      <input
        className="form-check-input cursor-pointer"
        type="checkbox"
        value={checked ? '1' : '0'}
        ref={ref}
        onChange={onChange}
        style={{ transform: 'scale(1.5)' }}
      />
    </span>
  )
}

export const Downloading: FC<{ title: string; style?: React.CSSProperties }> = ({ title, style }) => {
  return (
    <span
      title={title}
      className="inline-flex cursor-progress items-center rounded p-1.5 hover:bg-gray-300/40 dark:hover:bg-gray-600/40"
      style={style}
    >
      <LoadingIcon className="inline-block h-4 w-4 animate-spin" />
    </span>
  )
}

const FileListing: FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const [layout, _] = useLocalStorage('preferredLayout', layouts[0])

  const router = useRouter()
  const path = queryToPath(query)

  // Streaming file fetching, we can render a file page directly if we have its path
  const { data, error, size, setSize, mutate } = useProtectedSWRInfinite(path)

  const responses: any[] = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && typeof data[data.length - 1] === 'undefined')
  const onlyOnePage = data && data[0] && 'folder' in data[0] && data[0].folder.page_count <= 1

  const folderChildren = responses.length
    ? [
        ...('folder' in responses[0] ? responses[0].folder.value : []),
        ...(responses.length > 1 && 'folder' in responses[1] ? responses[1].folder.value : []),
      ]
    : []

  // File selection state
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [totalSelected, setTotalSelected] = useState<number>(0)
  const [totalGenerating, setTotalGenerating] = useState<boolean>(false)
  const [folderGenerating, setFolderGenerating] = useState<{ [key: string]: boolean }>({})

  // README.md preview
  const readmeFile = folderChildren.find(c => c.name.toLowerCase() === 'readme.md')

  // Functions for file selection and download
  const getFiles = () => {
    return folderChildren.filter(c => 'file' in c)
  }

  const genTotalSelected = (selected: { [key: string]: boolean }) => {
    return Object.values(selected).filter(s => s).length
  }

  const toggleItemSelected = (id: string) => {
    setSelected(prev => {
      return { ...prev, [id]: !prev[id] }
    })
    setTotalSelected(genTotalSelected({ ...selected, [id]: !selected[id] }))
  }

  const toggleTotalSelected = () => {
    if (totalSelected > 0) {
      setSelected({})
      setTotalSelected(0)
      return
    }

    const files = getFiles()
    const newSelected: { [key: string]: boolean } = {}
    files.forEach(f => {
      newSelected[f.id] = true
    })
    setSelected(newSelected)
    setTotalSelected(files.length)
  }

  // Selected file download
  const handleSelectedDownload = async () => {
    const files = getFiles().filter(f => selected[f.id])
    if (files.length === 0) {
      toast.error('请至少选择一个文件')
      return
    }

    setTotalGenerating(true)
    const toastId = toast.loading(<DownloadingToast router={router} />)
    const folderName = path.substring(path.lastIndexOf('/') + 1)

    try {
      await downloadMultipleFiles({
        toastId,
        router,
        files: files.map(f => ({
          name: f.name,
          url: `/api/raw?path=${path}/${encodeURIComponent(f.name)}`,
        })),
        folder: folderName ? decodeURIComponent(folderName) : undefined,
      })
      setTotalGenerating(false)
      toast.success('文件下载成功', { id: toastId })
    } catch (error) {
      setTotalGenerating(false)
      toast.error('文件下载失败', { id: toastId })
    }
  }

  // Folder recursive download
  const handleFolderDownload = async (id: string, name?: string) => {
    const token = getStoredToken(path)
    const hashedTokenForPath = token ? encodeURIComponent(token) : ''

    if (folderGenerating[id]) {
      toast.error('文件夹正在生成中，请稍后再试。')
      return
    }

    setFolderGenerating(prev => ({ ...prev, [id]: true }))
    const toastId = toast.loading(<DownloadingToast router={router} />)

    try {
      // 找到当前文件夹对象
      const currentFolder = folderChildren.find(c => c.id === id)
      if (!currentFolder || !currentFolder.folder) {
        throw new Error('找不到文件夹')
      }
      
      // 构建文件夹路径
      const folderPath = `${path}/${encodeURIComponent(currentFolder.name)}`
      
      // 创建适配器函数，将traverseFolder的结果转换为downloadTreelikeMultipleFiles需要的格式
      const adapter = async function* () {
        for await (const item of traverseFolder(folderPath)) {
          yield {
            name: item.meta.name || 'unknown',
            url: item.isFolder ? undefined : `/api/raw?path=${item.path}${hashedTokenForPath ? `&odpt=${hashedTokenForPath}` : ''}`,
            path: item.path,
            isFolder: item.isFolder,
          }
        }
      }

      await downloadTreelikeMultipleFiles({
        toastId,
        router,
        files: adapter(),
        basePath: path,
        folder: currentFolder.name,
      })
      
      setFolderGenerating(prev => ({ ...prev, [id]: false }))
      toast.success('文件夹下载完成。', { id: toastId })
    } catch (error) {
      setFolderGenerating(prev => ({ ...prev, [id]: false }))
      toast.error('文件夹下载失败。', { id: toastId })
    }
  }

  if (isLoadingInitialData) {
    return <Loading loadingText="加载中" />
  }

  if (error) {
    return (
      <PreviewContainer>
        {error.status === 401 ? (
          <Auth redirect={path} />
        ) : (
          <FourOhFour errorMsg={JSON.stringify(error.message)} />
        )}
      </PreviewContainer>
    )
  }

  if ('folder' in responses[0]) {
    // Render as folder

    // Folder is empty
    if (folderChildren.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
          <div className="text-xl font-bold">这个文件夹是空的</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">此文件夹中没有任何文件或文件夹</div>
        </div>
      )
    }

    // 使用新的文件浏览器组件
    return (
      <>
        <Toaster />
        <FileExplorer
          query={query || {}}
          folderChildren={folderChildren}
          path={path}
          selected={selected}
          toggleItemSelected={toggleItemSelected}
          totalSelected={totalSelected}
          toggleTotalSelected={toggleTotalSelected}
          totalGenerating={totalGenerating}
          handleSelectedDownload={handleSelectedDownload}
          folderGenerating={folderGenerating}
          handleFolderDownload={handleFolderDownload}
        />

        <div className="border-b border-gray-200 p-3 text-center font-mono text-sm text-gray-400 dark:border-gray-700">
          {`- 显示 ${size} 页 ` +
            (isLoadingMore ? `共 ... 个文件 -` : `共 ${folderChildren.length} 个文件 -`)}
        </div>

        {readmeFile && (
          <div className="mt-4">
            <MarkdownPreview file={readmeFile} path={path} standalone={false} />
          </div>
        )}
      </>
    )
  }

  if ('file' in responses[0] && responses.length === 1) {
    const file = responses[0].file as OdFileObject
    const previewType = getPreviewType(getExtension(file.name), { video: Boolean(file.video) })

    if (previewType) {
      switch (previewType) {
        case preview.image:
          return <ImagePreview file={file} />

        case preview.text:
          return <TextPreview file={file} />

        case preview.code:
          return <CodePreview file={file} />

        case preview.markdown:
          return <MarkdownPreview file={file} path={path} />

        case preview.video:
          return <VideoPreview file={file} />

        case preview.audio:
          return <AudioPreview file={file} />

        case preview.pdf:
          return <PDFPreview file={file} />

        case preview.office:
          return <OfficePreview file={file} />

        case preview.epub:
          return <EPUBPreview file={file} />

        case preview.url:
          return <URLPreview file={file} />

        default:
          return <DefaultPreview file={file} />
      }
    } else {
      return <DefaultPreview file={file} />
    }
  }

  return (
    <PreviewContainer>
      <FourOhFour errorMsg={`无法预览 ${path}`} />
    </PreviewContainer>
  )
}
export default FileListing
