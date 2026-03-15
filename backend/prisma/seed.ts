import { PrismaClient, UserRole, AgencyStatus, VerificationStatus, TradeType, Language } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.tradeVerification.deleteMany();
  await prisma.tradeTransaction.deleteMany();
  await prisma.property.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // Create Agencies
  console.log('🏢 Creating agencies...');
  const agency1 = await prisma.agency.create({
    data: {
      name: 'Kabul Real Estate Agency',
      licenseNumber: 'KBL-2024-001',
      address: 'Wazir Akbar Khan, Kabul',
      region: 'Kabul',
      status: AgencyStatus.ACTIVE,
    },
  });

  const agency2 = await prisma.agency.create({
    data: {
      name: 'Herat Property Solutions',
      licenseNumber: 'HRT-2024-002',
      address: 'Darwaze-e Khush, Herat',
      region: 'Herat',
      status: AgencyStatus.ACTIVE,
    },
  });

  const agency3 = await prisma.agency.create({
    data: {
      name: 'Mazar Property Group',
      licenseNumber: 'MZR-2024-003',
      address: 'Balkh Street, Mazar-i-Sharif',
      region: 'Balkh',
      status: AgencyStatus.ACTIVE,
    },
  });

  const agency4 = await prisma.agency.create({
    data: {
      name: 'Kandahar Realty',
      licenseNumber: 'KDR-2024-004',
      address: 'Mirwais Mena, Kandahar',
      region: 'Kandahar',
      status: AgencyStatus.BANNED,
    },
  });

  console.log(`✅ Created 4 agencies`);

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      fullName: 'Ahmad Shah Durrani',
      email: 'admin@rems.gov.af',
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      language: Language.EN,
      isActive: true,
    },
  });

  // Agency Admins
  const agencyAdmin1 = await prisma.user.create({
    data: {
      fullName: 'Hamid Karzai',
      email: 'hamid@kabul-agency.af',
      passwordHash: hashedPassword,
      role: UserRole.AGENCY_ADMIN,
      language: Language.FA,
      isActive: true,
      agencyId: agency1.id,
    },
  });

  const agencyAdmin2 = await prisma.user.create({
    data: {
      fullName: 'Ismail Khan',
      email: 'ismail@herat-agency.af',
      passwordHash: hashedPassword,
      role: UserRole.AGENCY_ADMIN,
      language: Language.FA,
      isActive: true,
      agencyId: agency2.id,
    },
  });

  const agencyAdmin3 = await prisma.user.create({
    data: {
      fullName: 'Abdul Rashid Dostum',
      email: 'dostum@mazar-agency.af',
      passwordHash: hashedPassword,
      role: UserRole.AGENCY_ADMIN,
      language: Language.FA,
      isActive: true,
      agencyId: agency3.id,
    },
  });

  // Inspectors
  const inspector1 = await prisma.user.create({
    data: {
      fullName: 'Ashraf Ghani',
      email: 'inspector1@rems.gov.af',
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      language: Language.PS,
      isActive: true,
    },
  });

  const inspector2 = await prisma.user.create({
    data: {
      fullName: 'Abdullah Abdullah',
      email: 'inspector2@rems.gov.af',
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      language: Language.FA,
      isActive: true,
    },
  });

  const inspector3 = await prisma.user.create({
    data: {
      fullName: 'Zalmai Rassoul',
      email: 'inspector3@rems.gov.af',
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      language: Language.EN,
      isActive: true,
    },
  });

  console.log(`✅ Created 7 users`);

  // Create Properties
  console.log('🏠 Creating properties...');
  const properties: any[] = [];

  for (let i = 1; i <= 20; i++) {
    const agencies = [agency1, agency2, agency3];
    const regions = ['Kabul', 'Herat', 'Balkh', 'Kandahar', 'Nangarhar'];
    const randomAgency = agencies[Math.floor(Math.random() * agencies.length)];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];

    const property = await prisma.property.create({
      data: {
        title: `Property ${i} - ${randomRegion}`,
        cadastralNo: `CAD-${randomRegion.substring(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`,
        address: `Street ${i}, ${randomRegion}, Afghanistan`,
        region: randomRegion,
        agencyId: randomAgency.id,
      },
    });

    properties.push(property);
  }

  console.log(`✅ Created ${properties.length} properties`);

  // Create Transactions
  console.log('💼 Creating transactions...');
  const tradeTypes = [TradeType.SALE, TradeType.RENT, TradeType.TRANSFER];
  const statuses = [VerificationStatus.PENDING, VerificationStatus.APPROVED, VerificationStatus.REJECTED];

  for (let i = 1; i <= 30; i++) {
    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    const randomTradeType = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPrice = Math.floor(Math.random() * 500000) + 50000;

    const transaction = await prisma.tradeTransaction.create({
      data: {
        propertyId: randomProperty.id,
        agencyId: randomProperty.agencyId,
        tradeType: randomTradeType,
        buyerName: `Buyer ${i}`,
        sellerName: `Seller ${i}`,
        price: randomPrice,
        status: randomStatus,
      },
    });

    // Add verification for approved/rejected transactions
    if (randomStatus !== VerificationStatus.PENDING) {
      const randomInspector = [inspector1, inspector2, inspector3][Math.floor(Math.random() * 3)];
      
      await prisma.tradeVerification.create({
        data: {
          tradeId: transaction.id,
          verifiedBy: randomInspector.id,
          status: randomStatus,
          remarks: randomStatus === VerificationStatus.APPROVED 
            ? 'All documents verified and approved'
            : 'Missing required documentation',
        },
      });
    }
  }

  console.log(`✅ Created 30 transactions`);

  // Create Audit Logs
  console.log('📝 Creating audit logs...');
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const entities = ['Agency', 'Property', 'Transaction', 'User'];

  for (let i = 1; i <= 50; i++) {
    const randomUser = [superAdmin, agencyAdmin1, agencyAdmin2, inspector1, inspector2][Math.floor(Math.random() * 5)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomEntity = entities[Math.floor(Math.random() * entities.length)];

    await prisma.auditLog.create({
      data: {
        userId: randomUser.id,
        action: randomAction,
        entity: randomEntity,
        entityId: `entity-${i}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0',
        details: JSON.stringify({ 
          action: randomAction, 
          entity: randomEntity,
          timestamp: new Date()
        }),
      },
    });
  }

  console.log(`✅ Created 50 audit logs`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Agencies: 4`);
  console.log(`   - Users: 7`);
  console.log(`   - Properties: 20`);
  console.log(`   - Transactions: 30`);
  console.log(`   - Audit Logs: 50`);
  console.log('\n👤 Login Credentials:');
  console.log('   Super Admin:');
  console.log('     Email: admin@rems.gov.af');
  console.log('     Password: password123');
  console.log('\n   Agency Admin (Kabul):');
  console.log('     Email: hamid@kabul-agency.af');
  console.log('     Password: password123');
  console.log('\n   Inspector:');
  console.log('     Email: inspector1@rems.gov.af');
  console.log('     Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });