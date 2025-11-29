import { NextRequest, NextResponse } from 'next/server'
import { logApiRequest, ApiContext } from './api-middleware'

/**
 * Wraps an API handler to automatically log requests and responses
 */
export function withApiLogging<T extends object>(
  endpoint: string,
  handler: (request: NextRequest, context: ApiContext, body?: unknown) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: ApiContext, body?: unknown): Promise<NextResponse> => {
    const startTime = Date.now()
    
    // Get request metadata
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') ||
                      null
    
    let response: NextResponse
    let responseData: unknown
    
    try {
      response = await handler(request, context, body)
      
      // Try to clone and parse response for logging
      try {
        const clonedResponse = response.clone()
        responseData = await clonedResponse.json()
      } catch {
        // Response might not be JSON
        responseData = null
      }
    } catch (error) {
      // Log the error and rethrow
      const durationMs = Date.now() - startTime
      
      await logApiRequest({
        organizationId: context.organizationId,
        apiKeyId: context.apiKeyId,
        method: request.method,
        endpoint: endpoint,
        path: request.nextUrl.pathname,
        statusCode: 500,
        userAgent,
        ipAddress,
        requestBody: body,
        responseBody: { error: error instanceof Error ? error.message : 'Unknown error' },
        durationMs,
      })
      
      throw error
    }
    
    const durationMs = Date.now() - startTime
    
    // Log the request (non-blocking)
    logApiRequest({
      organizationId: context.organizationId,
      apiKeyId: context.apiKeyId,
      method: request.method,
      endpoint: endpoint,
      path: request.nextUrl.pathname,
      statusCode: response.status,
      userAgent,
      ipAddress,
      requestBody: body,
      responseBody: responseData,
      durationMs,
    }).catch(console.error) // Don't fail the request if logging fails

    logApiCall({
      request,
      context,
      endpoint: '/your-endpoint',
      statusCode: 200,
      requestBody: body,
      responseBody: responseData,
      startTime,
    })
    
    return response
  }
}

/**
 * Simple logging function to call at the end of API handlers
 */
export async function logApiCall({
  request,
  context,
  endpoint,
  statusCode,
  requestBody,
  responseBody,
  startTime,
}: {
  request: NextRequest
  context: ApiContext
  endpoint: string
  statusCode: number
  requestBody?: unknown
  responseBody?: unknown
  startTime: number
}) {
  const durationMs = Date.now() - startTime
  const userAgent = request.headers.get('user-agent')
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') ||
                    null

  // Fire and forget - don't await to avoid slowing down response
  logApiRequest({
    organizationId: context.organizationId,
    apiKeyId: context.apiKeyId,
    method: request.method,
    endpoint,
    path: request.nextUrl.pathname,
    statusCode,
    userAgent,
    ipAddress,
    requestBody,
    responseBody,
    durationMs,
  }).catch(console.error)
}
