import { PrismaClient, UserRole, UserStatus, FilingType, SubscriptionPlanType, TaskStatus, TaskPriority, AppointmentStatus, AppointmentType, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    const hashedPass = await bcrypt.hash('Demo@1234', 12);

    // 1. Subscription Plans
    const plansFree = await prisma.subscriptionPlan.upsert({
        where: { name: SubscriptionPlanType.FREE },
        update: {},
        create: {
            name: SubscriptionPlanType.FREE,
            displayName: 'Free',
            description: 'Get started with basic features',
            priceMonthly: 0,
            priceYearly: 0,
            maxClients: 10,
            maxStorageGb: 1,
            maxStaffMembers: 1,
            maxInvoicesPerMonth: 5,
            maxVideoCallHoursPerMonth: 2,
            features: { basic_chat: true, invoice_generation: true, task_management: true },
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
        },
    });

    const plansBasic = await prisma.subscriptionPlan.upsert({
        where: { name: SubscriptionPlanType.BASIC },
        update: {},
        create: {
            name: SubscriptionPlanType.BASIC,
            displayName: 'Basic',
            description: 'Perfect for solo CAs',
            priceMonthly: 999,
            priceYearly: 9990,
            maxClients: 50,
            maxStorageGb: 10,
            maxStaffMembers: 3,
            maxInvoicesPerMonth: 50,
            maxVideoCallHoursPerMonth: 10,
            features: { basic_chat: true, invoice_generation: true, task_management: true, document_management: true, video_calls: true, analytics: true },
            isActive: true,
            isFeatured: false,
            sortOrder: 2,
        },
    });

    const plansPro = await prisma.subscriptionPlan.upsert({
        where: { name: SubscriptionPlanType.PRO },
        update: {},
        create: {
            name: SubscriptionPlanType.PRO,
            displayName: 'Professional',
            description: 'Ideal for growing CA firms',
            priceMonthly: 2499,
            priceYearly: 24990,
            maxClients: 200,
            maxStorageGb: 50,
            maxStaffMembers: 10,
            maxInvoicesPerMonth: 200,
            maxVideoCallHoursPerMonth: 50,
            features: { 
                basic_chat: true, 
                invoice_generation: true, 
                task_management: true, 
                document_management: true, 
                video_calls: true, 
                analytics: true, 
                api_access: true, 
                priority_support: true, 
                recurring_invoices: true 
            },
            isActive: true,
            isFeatured: true,
            sortOrder: 3,
        },
    });

    const plansEnterprise = await prisma.subscriptionPlan.upsert({
        where: { name: SubscriptionPlanType.ENTERPRISE },
        update: {},
        create: {
            name: SubscriptionPlanType.ENTERPRISE,
            displayName: 'Enterprise',
            description: 'Unlimited for large firms',
            priceMonthly: 4999,
            priceYearly: 49990,
            features: { 
                all_features: true, 
                white_label: true, 
                custom_domain: true, 
                dedicated_manager: true 
            },
            isActive: true,
            isFeatured: false,
            sortOrder: 4,
        },
    });

    console.log('✅ Subscription plans created');

    // 2. Super Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@taxmate.in' },
        update: {},
        create: {
            email: 'admin@taxmate.in',
            name: 'Super Admin',
            passwordHash: hashedPass,
            emailVerified: true,
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            onboardingCompleted: true,
            loginCount: 1,
            lastLoginAt: new Date(),
        },
    });

    console.log('✅ Admin user created');

    // 3. Test CA User
    const ca1 = await prisma.user.create({
        data: {
            email: 'ca@taxmate.in',
            name: 'Rajesh Kumar',
            passwordHash: hashedPass,
            phone: '+919876543210',
            emailVerified: true,
            role: UserRole.CA,
            status: UserStatus.ACTIVE,
            onboardingCompleted: true,
            timezone: 'Asia/Kolkata',
            locale: 'en',
            loginCount: 0,
            caProfile: {
                create: {
                    icaiMembershipNumber: 'ICAI-001234',
                    firmName: 'Kumar & Associates',
                    designation: 'Chartered Accountant',
                    bio: 'Experienced CA with 15+ years in taxation and audit',
                    yearsOfExperience: 15,
                    specializations: ['Income Tax', 'GST', 'Corporate Audit'],
                    languages: ['English', 'Hindi'],
                    status: 'APPROVED',
                    approvedAt: new Date(),
                    officeAddress: '123 Business Park',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India',
                    gstin: '27AABCU1234H1Z0',
                    panNumber: 'AABCU1234H',
                    publicProfile: true,
                    consultationFee: 5000,
                    acceptsOnlinePayment: true,
                    totalClients: 0,
                },
            },
            subscription: {
                create: {
                    plan: SubscriptionPlanType.PRO,
                    status: 'ACTIVE',
                },
            },
        },
    });

    console.log('✅ CA user created (ca@taxmate.in)');

    // 4. Test Client User
    const client1 = await prisma.user.create({
        data: {
            email: 'client@taxmate.in',
            name: 'Amit Sharma',
            passwordHash: hashedPass,
            phone: '+919876543211',
            emailVerified: true,
            role: UserRole.CLIENT,
            status: UserStatus.ACTIVE,
            onboardingCompleted: true,
            timezone: 'Asia/Kolkata',
            locale: 'en',
            loginCount: 0,
            clientProfile: {
                create: {
                    caId: ca1.id,
                    panNumber: 'AAZPN1234H',
                    businessName: 'Tech Solutions Pvt Ltd',
                    businessType: 'Service',
                    gstin: '27AABCU1234H1Z1',
                    industry: 'IT Services',
                    annualTurnover: 5000000,
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560001',
                },
            },
        },
    });

    console.log('✅ Client user created (client@taxmate.in)');

    // 5. Services
    const service1 = await prisma.service.create({
        data: {
            caId: ca1.id,
            name: 'Income Tax Filing (Individual)',
            description: 'Complete individual ITR filing with documentation support',
            price: 2500,
            serviceType: 'FIXED',
            durationMinutes: 120,
        },
    });

    const service2 = await prisma.service.create({
        data: {
            caId: ca1.id,
            name: 'GST Registration & Compliance',
            description: 'GST registration, return filing, and quarterly compliance',
            price: 5000,
            serviceType: 'RECURRING',
            durationMinutes: 180,
        },
    });

    console.log('✅ Services created');

    // 6. Sample Appointments
    const appointment = await prisma.appointment.create({
        data: {
            caId: ca1.id,
            clientId: client1.id,
            title: 'Initial Consultation',
            description: 'Discuss tax planning and requirements',
            type: AppointmentType.VIDEO_CALL,
            status: AppointmentStatus.CONFIRMED,
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            durationMinutes: 60,
        },
    });

    console.log('✅ Appointment created');

    // 7. Sample Tasks
    const task = await prisma.task.create({
        data: {
            caId: ca1.id,
            clientId: client1.id,
            createdById: ca1.id,
            title: 'Collect and verify client documents',
            description: 'Request client to upload income proofs and expense receipts',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
    });

    console.log('✅ Task created');

    // 8. Compliance Calendar
    await prisma.complianceCalendar.create({
        data: {
            title: 'ITR Filing Deadline (Individual)',
            description: 'Last date to file ITR for AY 2024-25',
            dueDate: new Date('2024-12-31'),
            filingType: FilingType.ITR_1,
            applicableTo: ['INDIVIDUAL'],
            isRecurring: true,
            isActive: true,
        },
    });

    await prisma.complianceCalendar.create({
        data: {
            title: 'GST Return Filing (GSTR-3B)',
            description: 'Monthly GSTR-3B return filing',
            dueDate: new Date('2024-04-20'),
            filingType: FilingType.GSTR_3B,
            applicableTo: ['BUSINESS'],
            isRecurring: true,
            isActive: true,
        },
    });

    console.log('✅ Compliance calendar events created');

    // 9. FAQs
    await prisma.faq.create({
        data: {
            question: 'What documents do I need for ITR filing?',
            answer: 'For ITR filing, you typically need: Form 16 (if salaried), income proofs, investment documents, expense receipts, and previous year returns.',
            category: 'Taxation',
            sortOrder: 1,
            isActive: true,
        },
    });

    await prisma.faq.create({
        data: {
            question: 'What is the GST registration threshold?',
            answer: 'GST registration is mandatory if your annual turnover exceeds Rs. 40 lakhs (or Rs. 20 lakhs for certain states).',
            category: 'GST',
            sortOrder: 2,
            isActive: true,
        },
    });

    console.log('✅ FAQs created');

    console.log('\n✅ Database seed complete!');
    console.log('\n📝 Test Credentials:');
    console.log('  Admin: admin@taxmate.in / Demo@1234');
    console.log('  CA: ca@taxmate.in / Demo@1234');
    console.log('  Client: client@taxmate.in / Demo@1234');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
