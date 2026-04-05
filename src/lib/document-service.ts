import { prisma } from './prisma'

export const documentService = {
  // Upload document
  async uploadDocument(data: {
    clientId: string
    caId: string
    uploadedById: string
    name: string
    originalName: string
    type: string
    fileSize: number
    fileUrl: string
    fileKey: string
    mimeType?: string
    description?: string
  }) {
    return prisma.document.create({
      data: {
        clientId: data.clientId,
        caId: data.caId,
        uploadedById: data.uploadedById,
        name: data.name,
        originalName: data.originalName,
        type: data.type,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey,
        mimeType: data.mimeType,
        description: data.description,
        version: 1,
      },
    })
  },

  // Get documents by client
  async getDocumentsByClient(clientId: string, filters?: {
    type?: string
    skip?: number
    take?: number
  }) {
    const where: any = { clientId, isDeleted: false }
    if (filters?.type) where.type = filters.type

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

  // Get recently updated documents
  async getRecentDocuments(caId: string, limit: number = 30) {
    return prisma.document.findMany({
      where: {
        caId,
        isDeleted: false,
      },
      include: {
        client: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })
  },

  // Get documents by type
  async getDocumentsByType(clientId: string, type: string) {
    return prisma.document.findMany({
      where: {
        clientId,
        type,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Create document version
  async createDocumentVersion(originalDocId: string, data: {
    fileUrl: string
    fileKey: string
    fileSize: number
    description?: string
    uploadedById: string
  }) {
    const original = await prisma.document.findUnique({
      where: { id: originalDocId },
    })
    if (!original) throw new Error('Document not found')

    return prisma.document.create({
      data: {
        clientId: original.clientId,
        caId: original.caId,
        uploadedById: data.uploadedById,
        name: original.name,
        originalName: original.originalName,
        type: original.type,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey,
        mimeType: original.mimeType,
        description: data.description,
        version: original.version + 1,
      },
    })
  },

  // Get document storage stats
  async getDocumentStats(caId: string) {
    const documents = await prisma.document.findMany({ where: { caId } })
    
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    const byType = documents.reduce((acc: any, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {})

    return {
      totalDocuments: documents.length,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024),
      byType,
    }
  },

  // Share document
  async shareDocument(documentId: string, sharedWithClient: boolean = true) {
    return prisma.document.update({
      where: { id: documentId },
      data: { 
        isSharedWithClient: sharedWithClient,
        sharedAt: sharedWithClient ? new Date() : null,
      },
    })
  },
}
