import cron from 'node-cron';
import { getServiceClient } from '../../src/lib/backend/supabase';
import { addDays } from 'date-fns';

// Run daily at 9 AM IST
cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    const sevenDaysOut = addDays(today, 7);
    const supabase = getServiceClient();

    // Upcoming filing deadlines
    const { data: upcomingFilings } = await supabase
        .from('tax_filings')
        .select('*')
        .not('status', 'in', '("COMPLETED","CANCELLED")')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', sevenDaysOut.toISOString().split('T')[0]);

    if (upcomingFilings && upcomingFilings.length > 0) {
        const caIds = Array.from(new Set(upcomingFilings.map(f => f.ca_id)));
        const clientIds = Array.from(new Set(upcomingFilings.map(f => f.client_id)));
        const allUserIds = Array.from(new Set([...caIds, ...clientIds]));

        const { data: usersData } = await supabase
            .from('users')
            .select('id, email, name')
            .in('id', allUserIds);

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

        for (const filing of upcomingFilings) {
            const dueDateObj = new Date(filing.due_date);
            const daysLeft = Math.ceil((dueDateObj.getTime() - today.getTime()) / 86400000);
            const clientUser = usersMap.get(filing.client_id);

            await supabase.from('notifications').insert([
                {
                    user_id: filing.ca_id,
                    type: 'FILING_DEADLINE',
                    title: `${filing.filing_type} deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
                    message: `${clientUser?.name || 'Client'} — Due: ${dueDateObj.toLocaleDateString('en-IN')}`,
                    related_entity_type: 'filing',
                    related_entity_id: filing.id,
                },
                {
                    user_id: filing.client_id,
                    type: 'FILING_DEADLINE',
                    title: `Your ${filing.filing_type} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
                    message: `Financial Year: ${filing.financial_year}`,
                    related_entity_type: 'filing',
                    related_entity_id: filing.id,
                }
            ]);
        }
    }

    // Update overdue invoices
    await supabase
        .from('invoices')
        .update({ status: 'OVERDUE' })
        .in('status', ['SENT', 'VIEWED', 'PARTIALLY_PAID'])
        .lt('due_date', today.toISOString().split('T')[0]);

    // Appointment reminders (24h)
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'CONFIRMED')
        .gte('scheduled_at', tomorrowStart.toISOString())
        .lte('scheduled_at', tomorrowEnd.toISOString());

    const unnotifiedAppointments = (appointments || []).filter(apt => !apt.metadata?.reminderSent24h);

    if (unnotifiedAppointments.length > 0) {
        const caIds = Array.from(new Set(unnotifiedAppointments.map(a => a.ca_id)));
        const clientIds = Array.from(new Set(unnotifiedAppointments.map(a => a.client_id)));
        const allUserIds = Array.from(new Set([...caIds, ...clientIds]));

        const { data: usersData } = await supabase
            .from('users')
            .select('id, email, name')
            .in('id', allUserIds);

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

        for (const apt of unnotifiedAppointments) {
            const clientUser = usersMap.get(apt.client_id);

            await supabase.from('notifications').insert([
                {
                    user_id: apt.ca_id,
                    type: 'APPOINTMENT_REMINDER',
                    title: `Appointment reminder with ${clientUser?.name || 'Client'}`,
                    message: `Tomorrow at ${new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                    related_entity_type: 'appointment',
                    related_entity_id: apt.id,
                },
                {
                    user_id: apt.client_id,
                    type: 'APPOINTMENT_REMINDER',
                    title: `Appointment reminder with your CA`,
                    message: `Tomorrow at ${new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                    related_entity_type: 'appointment',
                    related_entity_id: apt.id,
                }
            ]);

            const updatedMetadata = { ...apt.metadata, reminderSent24h: true };
            await supabase
                .from('appointments')
                .update({ metadata: updatedMetadata })
                .eq('id', apt.id);
        }
    }

    console.log(`[Cron] Reminders sent at ${new Date().toISOString()}`);
}, { timezone: 'Asia/Kolkata' });

// Recurring invoices — hourly
cron.schedule('0 * * * *', async () => {
    const today = new Date();
    const supabase = getServiceClient();

    const { data: allInvoices } = await supabase
        .from('invoices')
        .select('*');

    const templates = (allInvoices || []).filter(inv => {
        const meta = inv.metadata || {};
        const isRecurring = meta.isRecurring === true || meta.isRecurring === 'true';
        const isParent = !meta.recurringParentId;
        const nextDate = meta.nextInvoiceDate ? new Date(meta.nextInvoiceDate) : null;
        const endDate = meta.recurringEndDate ? new Date(meta.recurringEndDate) : null;

        return isRecurring && isParent && nextDate && nextDate <= today && (!endDate || endDate >= today);
    });

    for (const template of templates) {
        const meta = template.metadata || {};
        const nextInvoiceNum = `INV-${Date.now()}`;

        await supabase
            .from('invoices')
            .insert({
                ca_id: template.ca_id,
                client_id: template.client_id,
                invoice_number: nextInvoiceNum,
                description: template.description,
                subtotal: template.subtotal || template.amount,
                tax_amount: template.tax_amount || 0,
                discount_amount: template.discount_amount || 0,
                total_amount: template.total_amount || template.amount,
                currency: template.currency || 'INR',
                status: 'DRAFT',
                issue_date: today.toISOString().split('T')[0],
                due_date: template.due_date || null,
                line_items: template.line_items || [],
                metadata: {
                    isRecurring: false,
                    recurringParentId: template.id,
                }
            });

        // Calculate next date
        let nextDate = new Date(today);
        switch (meta.recurringFrequency) {
            case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
            case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
            case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
            default: nextDate.setMonth(nextDate.getMonth() + 1); break;
        }

        const updatedMetadata = {
            ...meta,
            nextInvoiceDate: nextDate.toISOString()
        };

        await supabase
            .from('invoices')
            .update({ metadata: updatedMetadata })
            .eq('id', template.id);
    }
});
