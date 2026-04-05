import { prisma } from './prisma'

export const notificationService = {
  // Create notification
  async createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    relatedId?: string
    relatedType?: string
    actionUrl?: string
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        actionUrl: data.actionUrl,
        read: false,
      },
    })
  },

  // Get notifications
  async getNotifications(userId: string, filters?: {
    read?: boolean
    type?: string
    skip?: number
    take?: number
  }) {
    const where: any = { userId }
    if (filters?.read !== undefined) where.read = filters.read
    if (filters?.type) where.type = filters.type

    const notifications = await prisma.notification.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      orderBy: { createdAt: 'desc' },
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    })

    return { notifications, unreadCount }
  },

  // Mark as read
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    })
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    })
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: { id: notificationId },
    })
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    })
  },

  // Bulk create notifications
  async createBulkNotifications(userIds: string[], data: {
    type: string
    title: string
    message: string
    relatedId?: string
    relatedType?: string
    actionUrl?: string
  }) {
    return Promise.all(
      userIds.map((userId) =>
        this.createNotification({ ...data, userId })
      )
    )
  },

  // Get notification preferences
  async getPreferences(userId: string) {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    })
  },

  // Update notification preferences
  async updatePreferences(userId: string, data: any) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
  },
}
