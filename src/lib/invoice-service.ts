import { prisma } from './prisma'

export const invoiceService = {
  // Create invoice
  async createInvoice(data: {
    caId: string
    clientId: string
    amount: number
    taxAmount?: number
    description?: string
    dueDate?: Date
    items?: any[]
  }) {
    const invoice = await prisma.invoice.create({
      data: {
        caInvoiced: { connect: { id: data.caId } },
        clientInvoiced: { connect: { id: data.clientId } },
        amount: data.amount,
        taxAmount: data.taxAmount || 0,
        totalAmount: (data.amount || 0) + (data.taxAmount || 0),
        description: data.description,
        dueDate: data.dueDate,
        items: data.items || [],
        status: 'DRAFT',
        invoiceNumber: `INV-${Date.now()}`,
      },
    })

    return invoice
  },

  // Get invoices
  async getInvoices(filters?: {
    caId?: string
    clientId?: string
    status?: string
    skip?: number
    take?: number
  }) {
    const where: any = {}
    if (filters?.caId) where.caInvoicedId = filters.caId
    if (filters?.clientId) where.clientInvoicedId = filters.clientId
    if (filters?.status) where.status = filters.status

    const invoices = await prisma.invoice.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      include: { client: true, ca: true, payments: true },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.invoice.count({ where })
    return { invoices, total }
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, ca: true, payments: true },
    })
  },

  // Update invoice
  async updateInvoice(invoiceId: string, data: any) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data,
      include: { client: true, ca: true, payments: true },
    })
  },

  // Send invoice
  async sendInvoice(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
      include: { client: true },
    })
  },

  // Get overdue invoices
  async getOverdueInvoices(caId: string) {
    return prisma.invoice.findMany({
      where: {
        caInvoicedId: caId,
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: { client: true, payments: true },
      orderBy: { dueDate: 'asc' },
    })
  },

  // Get invoice summary
  async getInvoiceSummary(caId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { caInvoicedId: caId },
      include: { payments: true },
    })

    const total = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const paid = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const pending = total - paid

    return {
      totalInvoices: invoices.length,
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
      pendingCount: invoices.filter((inv) => inv.status !== 'PAID').length,
    }
  },

  // Record payment
  async recordPayment(invoiceId: string, data: {
    amount: number
    method: string
    transactionId?: string
    notes?: string
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    })
    if (!invoice) throw new Error('Invoice not found')

    const totalPaid = invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const isPaid = totalPaid + data.amount >= (invoice.totalAmount || 0)

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method,
        transactionId: data.transactionId,
        notes: data.notes,
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    })

    if (isPaid) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      })
    }

    return payment
  },
}
