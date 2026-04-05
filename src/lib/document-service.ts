import { prisma } from './prisma'

export const documentService = {
  // Upload document
  async uploadDocument(data: {
    clientId: string
    caId: string
    fileName: string
    fileSize: number
    fileType: string
    fileUrl: string
    category: 'GST' | 'ITR' | 'BANK' | 'BUSINESS' | 'PERSONAL' | 'OTHER'
    expiryDate?: Date
    description?: string
  }) {
    return prisma.document.create({
      data: {
        clientId: data.clientId,
        caId: data.caId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        category: data.category,
        expiryDate: data.expiryDate,
        description: data.description,
        version: 1,
        status: 'ACTIVE',
      },
    })
  },

  // Get documents by client
  async getDocumentsByClient(clientId: string, filters?: {
    category?: string
    status?: string
    skip?: number
    take?: number
  }) {
    const where: any = { clientId }
    if (filters?.category) where.category = filters.category
    if (filters?.status) where.status = filters.status

    const documents = await prisma.document.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.document.count({ where })
    return { documents, total }
  },

  // Get document by ID
  async getDocumentById(documentId: string) {
    return prisma.document.findUnique({
      where: { id: documentId },
    })
  },

  // Update document
  async updateDocument(documentId: string, data: any) {
    return prisma.document.update({
      where: { id: documentId },
      data,
    })
  },

  // Delete document
  async deleteDocument(documentId: string) {
    return prisma.document.delete({
      where: { id: documentId },
    })
  },

  // Get expiring documents
  async getExpiringDocuments(caId: string, daysUntilExpiry: number = 30) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry)

    return prisma.document.findMany({
      where: {
        caId,
        expiryDate: {
          lte: expiryDate,
          gt: new Date(),
        },
        status: 'ACTIVE',
      },
      include: {
        client: true,
      },
      orderBy: { expiryDate: 'asc' },
    })
  },

  // Get documents by category
  async getDocumentsByCategory(clientId: string, category: string) {
    return prisma.document.findMany({
      where: {
        clientId,
        category,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Create document version
  async createDocumentVersion(originalDocId: string, data: {
    fileUrl: string
    fileSize: number
    description?: string
  }) {
    const original = await prisma.document.findUnique({
      where: { id: originalDocId },
    })
    if (!original) throw new Error('Document not found')

    return prisma.document.create({
      data: {
        clientId: original.clientId,
        caId: original.caId,
        fileName: original.fileName,
        fileSize: data.fileSize,
        fileType: original.fileType,
        fileUrl: data.fileUrl,
        category: original.category,
        expiryDate: original.expiryDate,
        description: data.description,
        version: original.version + 1,
        status: 'ACTIVE',
        parentDocumentId: originalDocId,
      },
    })
  },

  // Get document storage stats
  async getDocumentStats(caId: string) {
    const documents = await prisma.document.findMany({ where: { caId } })
    
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    const byCategory = documents.reduce((acc: any, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1
      return acc
    }, {})

    return {
      totalDocuments: documents.length,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024),
      byCategory,
    }
  },

  // Share document
  async shareDocument(documentId: string, sharedWith: string[]) {
    return prisma.document.update({
      where: { id: documentId },
      data: { sharedWith },
    })
  },
}
