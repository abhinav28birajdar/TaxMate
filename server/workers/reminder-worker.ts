import cron from 'node-cron';
import { prisma } from '../../src/lib/prisma';
import { addDays } from 'date-fns';

// Run daily at 9 AM IST
cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    const sevenDaysOut = addDays(today, 7);

    // Upcoming filing deadlines
    const upcomingFilings = await prisma.taxFiling.findMany({
        where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { gte: today, lte: sevenDaysOut },
        },
        include: { ca: { select: { id: true, email: true, name: true } }, client: { select: { id: true, email: true, name: true } } },
    });

    for (const filing of upcomingFilings) {
        const daysLeft = Math.ceil((filing.dueDate!.getTime() - today.getTime()) / 86400000);

        // Create in-app notifications
        await prisma.notification.createMany({
            data: [
                {
                    userId: filing.caId,
                    type: 'FILING_DEADLINE',
                    title: `${filing.type} deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
                    body: `${filing.client.name} — Due: ${filing.dueDate?.toLocaleDateString('en-IN')}`,
                    link: `/tax-filings/${filing.id}`,
                    sourceType: 'filing',
                    sourceId: filing.id,
                    priority: daysLeft <= 3 ? 'high' : 'normal',
                },
                {
                    userId: filing.clientId,
                    type: 'FILING_DEADLINE',
                    title: `Your ${filing.type} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
                    body: `Financial Year: ${filing.financialYear}`,
                    link: `/tax-filings/${filing.id}`,
                    priority: daysLeft <= 3 ? 'high' : 'normal',
                },
            ],
            skipDuplicates: true,
        });
    }

    // Update overdue invoices
    await prisma.invoice.updateMany({
        where: {
            status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID'] },
            dueDate: { lt: today },
        },
        data: { status: 'OVERDUE' },
    });

    // Appointment reminders (24h)
    const appointments = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            scheduledAt: { gte: today, lte: addDays(today, 1) },
            reminderSent24h: false,
        },
        include: { ca: true, client: true },
    });

    for (const apt of appointments) {
        await prisma.notification.createMany({
            data: [
                {
                    userId: apt.caId,
                    type: 'APPOINTMENT_REMINDER',
                    title: `Appointment reminder with ${apt.client.name}`,
                    body: `Tomorrow at ${apt.scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                    link: `/appointments/${apt.id}`,
                    priority: 'high',
                },
                {
                    userId: apt.clientId,
                    type: 'APPOINTMENT_REMINDER',
                    title: `Appointment reminder with your CA`,
                    body: `Tomorrow at ${apt.scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                    link: `/appointments/${apt.id}`,
                    priority: 'high',
                },
            ],
        });
        await prisma.appointment.update({ where: { id: apt.id }, data: { reminderSent24h: true } });
    }

    console.log(`[Cron] Reminders sent at ${new Date().toISOString()}`);
}, { timezone: 'Asia/Kolkata' });

// Recurring invoices — hourly
cron.schedule('0 * * * *', async () => {
    const today = new Date();
    const recurringTemplates = await prisma.invoice.findMany({
        where: {
            isRecurring: true,
            recurringParentId: null,
            nextInvoiceDate: { lte: today },
            OR: [{ recurringEndDate: null }, { recurringEndDate: { gte: today } }],
        },
        include: { lineItems: true },
    });

    for (const template of recurringTemplates) {
        await prisma.invoice.create({
            data: {
                caId: template.caId,
                clientId: template.clientId,
                status: 'DRAFT',
                subtotal: template.subtotal,
                cgstRate: template.cgstRate,
                sgstRate: template.sgstRate,
                igstRate: template.igstRate,
                cgstAmount: template.cgstAmount,
                sgstAmount: template.sgstAmount,
                igstAmount: template.igstAmount,
                totalAmount: template.totalAmount,
                dueAmount: template.totalAmount,
                currency: template.currency,
                invoiceDate: today,
                dueDate: template.dueDate,
                title: template.title,
                notes: template.notes,
                termsConditions: template.termsConditions,
                fromName: template.fromName,
                fromAddress: template.fromAddress,
                fromGstin: template.fromGstin,
                fromPan: template.fromPan,
                fromEmail: template.fromEmail,
                fromPhone: template.fromPhone,
                fromBankAccountNumber: template.fromBankAccountNumber,
                fromBankIfsc: template.fromBankIfsc,
                fromBankName: template.fromBankName,
                toName: template.toName,
                toAddress: template.toAddress,
                toGstin: template.toGstin,
                toEmail: template.toEmail,
                templateId: template.templateId,
                templateColor: template.templateColor,
                isRecurring: false,
                recurringParentId: template.id,
                lineItems: {
                    create: template.lineItems.map(({ id, invoiceId, ...item }) => item),
                },
            },
        });

        // Calculate next date
        let nextDate = new Date(today);
        switch (template.recurringFrequency) {
            case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
            case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
            case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
            default: nextDate.setMonth(nextDate.getMonth() + 1); break;
        }
        await prisma.invoice.update({ where: { id: template.id }, data: { nextInvoiceDate: nextDate } });
    }
});
