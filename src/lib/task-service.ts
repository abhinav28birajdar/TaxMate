import { prisma } from './prisma'

export const taskService = {
  // Create task
  async createTask(data: {
    caId?: string
    clientId?: string
    title: string
    description?: string
    status?: string
    priority?: string
    dueDate?: Date
    assignedTo?: string
    tags?: string[]
    recurring?: boolean
    recurringFrequency?: string
  }) {
    return prisma.task.create({
      data: {
        caTaskOwned: data.caId ? { connect: { id: data.caId } } : undefined,
        clientTask: data.clientId ? { connect: { id: data.clientId } } : undefined,
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
        tags: data.tags || [],
        recurring: data.recurring || false,
        recurringFrequency: data.recurringFrequency,
      },
    })
  },

  // Get tasks
  async getTasks(filters?: {
    caId?: string
    clientId?: string
    status?: string
    priority?: string
    skip?: number
    take?: number
  }) {
    const where: any = {}
    if (filters?.caId) where.caTaskOwnedId = filters.caId
    if (filters?.clientId) where.clientTaskId = filters.clientId
    if (filters?.status) where.status = filters.status
    if (filters?.priority) where.priority = filters.priority

    const tasks = await prisma.task.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      include: { client: true },
      orderBy: { dueDate: 'asc' },
    })

    const total = await prisma.task.count({ where })
    return { tasks, total }
  },

  // Get task by ID
  async getTaskById(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: { client: true },
    })
  },

  // Update task
  async updateTask(taskId: string, data: any) {
    return prisma.task.update({
      where: { id: taskId },
      data,
      include: { client: true },
    })
  },

  // Delete task
  async deleteTask(taskId: string) {
    return prisma.task.delete({
      where: { id: taskId },
    })
  },

  // Get overdue tasks
  async getOverdueTasks(caId: string) {
    return prisma.task.findMany({
      where: {
        caTaskOwnedId: caId,
        status: { not: 'DONE' },
        dueDate: {
          lt: new Date(),
        },
      },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
    })
  },

  // Get upcoming tasks
  async getUpcomingTasks(caId: string, days: number = 7) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    return prisma.task.findMany({
      where: {
        caTaskOwnedId: caId,
        status: { not: 'DONE' },
        dueDate: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
    })
  },

  // Get task summary
  async getTaskSummary(caId: string) {
    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({ where: { caTaskOwnedId: caId } }),
      prisma.task.count({
        where: { caTaskOwnedId: caId, status: 'DONE' },
      }),
      prisma.task.count({
        where: { caTaskOwnedId: caId, status: { not: 'DONE' } },
      }),
      prisma.task.count({
        where: {
          caTaskOwnedId: caId,
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
      }),
    ])

    return { total, completed, pending, overdue }
  },

  // Get tasks by priority
  async getTasksByPriority(caId: string, priority: string) {
    return prisma.task.findMany({
      where: {
        caTaskOwnedId: caId,
        priority,
        status: { not: 'DONE' },
      },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
    })
  },
}
