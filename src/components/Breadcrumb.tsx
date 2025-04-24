import type { ParsedUrlQuery } from 'querystring'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

import { cn } from '../lib/utils'
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'

interface BreadcrumbProps {
  query: ParsedUrlQuery
}

function Breadcrumb({ query }: BreadcrumbProps) {
  // 从查询参数中获取路径
  const path = Array.isArray(query.path) ? query.path.join('/') : query.path || ''
  
  // 将路径分割成各个部分
  const pathSegments = path.split('/').filter(Boolean)
  
  // 构建面包屑导航项
  const breadcrumbItems = pathSegments.map((segment, index) => {
    // 构建当前段的完整路径
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    
    return {
      name: decodeURIComponent(segment),
      href
    }
  })

  return (
    <BreadcrumbRoot className="mb-4">
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <Link href="/" className="flex items-center gap-1 text-zinc-400 hover:text-red-500">
            <Home className="h-4 w-4" />
            <span>首页</span>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </BreadcrumbSeparator>
        
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.href}>
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage className="text-white">{item.name}</BreadcrumbPage>
            ) : (
              <>
                <Link 
                  href={item.href}
                  className="text-zinc-400 hover:text-red-500"
                >
                  {item.name}
                </Link>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </BreadcrumbSeparator>
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}

export default Breadcrumb
