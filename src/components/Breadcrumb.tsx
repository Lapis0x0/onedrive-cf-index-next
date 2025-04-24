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

const HomeCrumb = () => {
  return (
    <Link href="/" className="flex items-center text-foreground hover:text-red-500">
      <Home className="h-4 w-4" />
      <span className="ml-2 font-medium">{'首页'}</span>
    </Link>
  )
}

const Breadcrumb: React.FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  if (query) {
    const { path } = query
    if (Array.isArray(path)) {
      return (
        <BreadcrumbRoot>
          <BreadcrumbList className="flex-wrap">
            <BreadcrumbItem>
              <HomeCrumb />
            </BreadcrumbItem>
            {path.map((p: string, i: number) => (
              <BreadcrumbItem key={i}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                {i === path.length - 1 ? (
                  <BreadcrumbPage>{p}</BreadcrumbPage>
                ) : (
                  <Link
                    href={`/${path
                      .slice(0, i + 1)
                      .map(p => encodeURIComponent(p))
                      .join('/')}`}
                    className="transition-colors hover:text-red-500"
                  >
                    {p}
                  </Link>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </BreadcrumbRoot>
      )
    }
  }

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <HomeCrumb />
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}

export default Breadcrumb
