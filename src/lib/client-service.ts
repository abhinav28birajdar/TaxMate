import { prisma } from './prisma'

export const clientService = {
  // Create client
  async createClient(caId: string, data: {
    name: string
    email?: string
    phone?: string
    type: 'INDIVIDUAL' | 'BUSINESS'
    businessName?: string
    panNumber?: string
    gstNumber?: string
    annualIncome?: number
    address?: string
    city?: string
    state?: string
    pincode?: string
    tags?: string[]
  }) {
    return prisma.client.create({
      data: {
        caId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        businessName: data.businessName,
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        annualIncome: data.annualIncome,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        tags: data.tags || [],
        status: 'ACTIVE',
      },
    })
  },

  // Get all clients for CA
  async getClientsByCA(caId: string, filters?: {
    search?: string
    type?: string
    status?: string
    skip?: number
    take?: number
  }) {
    const where: any = { caId }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { panNumber: { contains: filters.search, mode: 'insensitive' } },
        { gstNumber: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status

    const clients = await prisma.client.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      include: { documents: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.client.count({ where })
    return { clients, total }
  },

  // Get client by ID
  async getClientById(clientId: string) {
    return prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: true,
        tasks: true,
        invoices: true,
        appointments: true,
        taxFilings: true,
        notes: true,
      },
    })
  },

  // Update client
  async updateClient(clientId: string, data: any) {
    return prisma.client.update({
      where: { id: clientId },
      data,
      include: { documents: true, tasks: true },
    })
  },

  // Delete client
  async deleteClient(clientId: string) {
    return prisma.client.delete({
      where: { id: clientId },
    })
  },

  // Get client timeline/activity
  async getClientTimeline(clientId: string, limit: number = 50) {
    const [tasks, documents, invoices, appointments, notes] = await Promise.all([
      prisma.task.findMany({
        where: { clientId },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.document.findMany({
        where: { clientId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.findMany({
        where: { clientId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { clientId },
        take: limit,
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.note.findMany({
        where: { clientId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      tasks,
      documents,
      invoices,
      appointments,
      notes,
    }
  },

  // Add tags to client
  async addTagToClient(clientId: string, tag: string) {
    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) throw new Error('Client not found')

    const tags = client.tags || []
    if (!tags.includes(tag)) tags.push(tag)

    return prisma.client.update({
      where: { id: clientId },
      data: { tags },
    })
  },

  // Get clients by tag
  async getClientsByTag(caId: string, tag: string) {
    return prisma.client.findMany({
      where: {
        caId,
        tags: { has: tag },
      },
    })
  },
}
