// API Response Handler
export const apiCall = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API error')
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// HTTP Status Utilities
export const isSuccessStatus = (status: number) => status >= 200 && status < 300
export const isError = (error: any) => error instanceof Error
export const getErrorMessage = (error: any) => 
  error?.message || error?.error || 'An error occurred'

// Formatting Utilities
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Validation Utilities
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone: string) => {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))
}

export const isValidPAN = (pan: string) => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
}

export const isValidGST = (gst: string) => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
}

// File Utilities
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return '📄'
  if (type.includes('word')) return '📝'
  if (type.includes('sheet') || type.includes('csv')) return '📊'
  if (type.includes('image')) return '🖼️'
  if (type.includes('video')) return '🎥'
  if (type.includes('audio')) return '🎵'
  return '📎'
}

// Date Utilities
export const getDaysSince = (date: string | Date) => {
  const days = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  )
  return days
}

export const getDaysUntil = (date: string | Date) => {
  const days = Math.floor(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  return days
}

export const isOverdue = (dueDate: string | Date) => {
  return getDaysUntil(dueDate) < 0
}

export const isExpiring = (date: string | Date, daysWarning: number = 30) => {
  const days = getDaysUntil(date)
  return days <= daysWarning && days > 0
}

// String Utilities
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const truncate = (str: string, length: number = 50) => {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Array Utilities
export const groupBy = (array: any[], key: string) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {})
}

export const sortBy = (array: any[], key: string, order: 'asc' | 'desc' = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    const comparison = aVal > bVal ? 1 : -1
    return order === 'asc' ? comparison : -comparison
  })
}

// Status Badge Utilities
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    FAILED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    DONE: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-orange-500',
    HIGH: 'text-red-500',
    CRITICAL: 'text-red-700',
  }
  return colors[priority] || 'text-gray-500'
}
