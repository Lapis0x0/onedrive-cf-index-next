import axios from 'redaxios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath, getAccessToken } from '.'
import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextRequest): Promise<Response> {
  // Get access token from storage
  const accessToken = await getAccessToken()
  
  // 调试: 检查访问令牌是否存在
  console.log('Access token exists:', !!accessToken)

  // Query parameter from request
  const { q: searchQuery = '' } = Object.fromEntries(req.nextUrl.searchParams)
  
  // 调试: 记录搜索查询
  console.log('Search query:', searchQuery)

  // TODO: Set edge function caching for faster load times

  if (typeof searchQuery === 'string') {
    // Construct Microsoft Graph Search API URL, and perform search only under the base directory
    const searchRootPath = encodePath('/')
    const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'
    
    // 调试: 记录搜索路径
    console.log('Search root path:', searchRootPath)
    console.log('Encoded path:', encodedPath)

    const searchApi = `${apiConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`
    
    // 调试: 记录完整的搜索 API URL
    console.log('Search API URL:', searchApi)

    try {
      const { data } = await axios.get(searchApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,file,folder,parentReference',
          top: siteConfig.maxItems,
        },
      })
      
      // 调试: 记录返回的数据
      console.log('Search results count:', data.value?.length || 0)
      
      // 如果没有结果，记录可能的原因
      if (!data.value || data.value.length === 0) {
        console.log('No search results found. This could be due to:')
        console.log('1. No matching files/folders')
        console.log('2. Access token issues')
        console.log('3. API configuration problems')
        console.log('4. Search path configuration issues')
      }
      
      return NextResponse.json(data.value)
    } catch (error: any) {
      // 调试: 记录错误详情
      console.error('Search API error:', error?.response?.status, error?.response?.data)
      
      return new Response(JSON.stringify({ error: error?.response?.data ?? 'Internal server error.' }), {
        status: error?.response?.status ?? 500,
      })
    }
  } else {
    return NextResponse.json([])
  }
}
