import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function isFileType(file: File, types: string[]) {
  return types.some(type => file.type.includes(type))
}

export function formatFileType(type: string) {
  return type.split('/')[1]?.toUpperCase() || type
}

export function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`
}

export function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function formatTime(seconds: number, showHours = false) {
  const date = new Date(0)
  date.setSeconds(seconds)
  
  return date.toISOString()
    .substring(showHours ? 11 : 14, 19)
    .replace(/^(\d+:)?0(\d:)/, '$1$2')
    .replace(/^0(\d:)/, '$1')
}

export function formatTimeWithMs(ms: number) {
  const date = new Date(ms)
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const milliseconds = Math.floor(date.getUTCMilliseconds() / 10)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
}

export function formatRelativeTime(date: Date | string | number) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function isClient() {
  return typeof window !== 'undefined'
}

export function isServer() {
  return !isClient()
}

export function getBaseUrl() {
  if (isServer()) return ''
  return `${window.location.protocol}//${window.location.host}`
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function noop() {}

export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isEmpty(obj: any) {
  if (Array.isArray(obj)) return obj.length === 0
  if (isObject(obj)) return Object.keys(obj).length === 0
  return !obj
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key]
    }
    return acc
  }, {} as Pick<T, K>)
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as Partial<T>)
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '')
  } catch (error) {
    console.error('Parsing error on', { value }, error)
    return undefined
  }
}

export function safeParseJSON<T>(value: string, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

export function stringifyJSON<T>(value: T): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.error('Stringify error', error)
    return '{}'
  }
}

export function createSearchParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export function getSearchParam(key: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

export function updateSearchParams(params: Record<string, string | number | boolean | undefined>) {
  if (typeof window === 'undefined') return ''
  
  const searchParams = new URLSearchParams(window.location.search)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      searchParams.delete(key)
    } else {
      searchParams.set(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export function createUrl(path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const searchParams = createSearchParams(params)
  return `${path}${searchParams ? `?${searchParams}` : ''}`
}

export function getFileTypeIcon(type: string) {
  const fileTypes: Record<string, string> = {
    'audio/': 'file-audio',
    'video/': 'file-video',
    'image/': 'file-image',
    'text/': 'file-text',
    'application/pdf': 'file-pdf',
    'application/msword': 'file-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
    'application/vnd.ms-excel': 'file-spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-spreadsheet',
    'application/vnd.ms-powerpoint': 'file-presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-presentation',
    'application/zip': 'file-archive',
    'application/x-rar-compressed': 'file-archive',
    'application/x-7z-compressed': 'file-archive',
  }
  
  const matchedType = Object.keys(fileTypes).find((key) => type.startsWith(key))
  return matchedType ? fileTypes[matchedType] : 'file'
}

export function formatFileTypeForDisplay(type: string) {
  const typeMap: Record<string, string> = {
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'audio/ogg': 'OGG',
    'audio/webm': 'WebM',
    'audio/aac': 'AAC',
    'audio/mp4': 'MP4 Audio',
    'audio/x-m4a': 'M4A',
    'audio/x-wav': 'WAV',
    'audio/3gpp': '3GPP',
    'audio/3gpp2': '3GPP2',
  }
  
  return typeMap[type] || type.split('/').pop()?.toUpperCase() || 'AUDIO'
}

export function isAudioFile(file: File) {
  return file.type.startsWith('audio/') || [
    '.mp3', '.wav', '.ogg', '.webm', '.aac', '.m4a', '.mp4', '.3gp', '.3gpp', '.3g2', '.3gpp2',
  ].some(ext => file.name.toLowerCase().endsWith(ext))
}

export function formatAudioDuration(duration: number) {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getFileIcon(type: string) {
  const iconMap: Record<string, string> = {
    'audio/': 'volume-2',
    'video/': 'video',
    'image/': 'image',
    'application/pdf': 'file-text',
    'application/msword': 'file-text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-text',
    'application/vnd.ms-excel': 'file-spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-spreadsheet',
    'application/vnd.ms-powerpoint': 'file-presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-presentation',
    'text/': 'file-text',
    'application/zip': 'file-archive',
    'application/x-rar-compressed': 'file-archive',
    'application/x-7z-compressed': 'file-archive',
  }
  
  const matchedType = Object.keys(iconMap).find(key => type.startsWith(key))
  return matchedType ? iconMap[matchedType] : 'file'
}

export function getFileExtensionFromType(type: string) {
  const extensionMap: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/aac': 'aac',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/x-wav': 'wav',
    'audio/3gpp': '3gp',
    'audio/3gpp2': '3g2',
  }
  
  return extensionMap[type] || type.split('/').pop() || 'bin'
}
