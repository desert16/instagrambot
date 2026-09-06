"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
// Argon2 / PBKDF2 fallback password hasher for seed
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `pbkdf2$100000$${salt}$${hash}`;
}
async function main() {
    console.log('🌱 Seeding database...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@instagrambot.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword123!';
    // 1. Create or update root user
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Yönetici',
            passwordHash: hashPassword(adminPassword),
            emailVerifiedAt: new Date(),
        },
    });
    console.log(`✅ User created / verified: ${user.email}`);
    // 2. Create default workspace
    const workspace = await prisma.workspace.upsert({
        where: { slug: 'demo-workspace' },
        update: {},
        create: {
            name: 'Demo Workspace',
            slug: 'demo-workspace',
            ownerId: user.id,
            subscription: {
                create: {
                    plan: 'PRO',
                    status: 'ACTIVE',
                },
            },
        },
    });
    console.log(`✅ Workspace created: ${workspace.name}`);
    // 3. Ensure membership
    await prisma.workspaceMember.upsert({
        where: {
            workspaceId_userId: {
                workspaceId: workspace.id,
                userId: user.id,
            },
        },
        update: { role: client_1.Role.OWNER },
        create: {
            workspaceId: workspace.id,
            userId: user.id,
            role: client_1.Role.OWNER,
        },
    });
    // 4. Create tags
    const tags = [
        { name: 'VIP', color: '#f59e0b' },
        { name: 'Fiyat', color: '#10b981' },
        { name: 'Destek', color: '#3b82f6' },
        { name: 'Şikayet', color: '#ef4444' },
        { name: 'Satış', color: '#8b5cf6' },
    ];
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: {
                workspaceId_name: {
                    workspaceId: workspace.id,
                    name: tag.name,
                },
            },
            update: {},
            create: {
                workspaceId: workspace.id,
                name: tag.name,
                color: tag.color,
            },
        });
    }
    console.log('✅ Standard tags created');
    // 5. In development mode, seed a test Instagram account and conversation
    if (process.env.NODE_ENV !== 'production') {
        const testInstagramAccount = await prisma.instagramAccount.upsert({
            where: {
                workspaceId_externalAccountId: {
                    workspaceId: workspace.id,
                    externalAccountId: '17841400000000001',
                },
            },
            update: {},
            create: {
                workspaceId: workspace.id,
                externalAccountId: '17841400000000001',
                username: 'marka_ornek',
                name: 'Örnek Butik & Mağaza',
                profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                accountType: 'BUSINESS',
                status: client_1.InstagramAccountStatus.CONNECTED,
                messagingReady: true,
                webhookReady: true,
                aiReady: true,
                aiSettings: {
                    create: {
                        workspaceId: workspace.id,
                        enabled: true,
                        provider: 'gemini',
                        model: 'gemini-1.5-flash',
                        systemPrompt: 'Sen Örnek Butik firmasının Instagram müşteri temsilcisisin. Müşterilere güler yüzlü, samimi ve profesyonel Türkçe yanıtlar ver. Ürünlerimiz 1. sınıf kumaştan üretilmiştir.',
                        temperature: 0.7,
                        fallbackMessage: 'Bu konuyu hemen yetkili arkadaşımıza iletiyorum, lütfen bekleyiniz.',
                        handoffKeywords: ['yetkili', 'insan', 'temsilci', 'şikayet', 'telefon'],
                    },
                },
            },
        });
        // Sample Contact
        const contact = await prisma.contact.upsert({
            where: {
                instagramAccountId_externalUserId: {
                    instagramAccountId: testInstagramAccount.id,
                    externalUserId: 'user_mock_9921',
                },
            },
            update: {},
            create: {
                workspaceId: workspace.id,
                instagramAccountId: testInstagramAccount.id,
                externalUserId: 'user_mock_9921',
                username: 'ayse_yilmaz',
                name: 'Ayşe Yılmaz',
                profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            },
        });
        // Sample Conversation
        const conversation = await prisma.conversation.create({
            data: {
                workspaceId: workspace.id,
                instagramAccountId: testInstagramAccount.id,
                contactId: contact.id,
                status: client_1.ConversationStatus.OPEN,
                aiEnabled: true,
                unreadCount: 1,
                messages: {
                    create: [
                        {
                            direction: client_1.MessageDirection.INBOUND,
                            senderType: client_1.MessageSender.CUSTOMER,
                            text: 'Merhaba, keten takımın beyaz rengi stokta var mı?',
                            status: client_1.MessageStatus.DELIVERED,
                        },
                        {
                            direction: client_1.MessageDirection.OUTBOUND,
                            senderType: client_1.MessageSender.AI,
                            text: 'Merhaba Ayşe Hanım! Evet, keten takımımızın beyaz rengi S, M ve L bedenlerde güncel olarak stoklarımızda mevcuttur. Dilerseniz siparişinizi hemen oluşturabilirsiniz!',
                            status: client_1.MessageStatus.SENT,
                        },
                        {
                            direction: client_1.MessageDirection.INBOUND,
                            senderType: client_1.MessageSender.CUSTOMER,
                            text: 'Harika! Kargo ücreti var mı?',
                            status: client_1.MessageStatus.DELIVERED,
                        },
                    ],
                },
            },
        });
        console.log(`✅ Sample Instagram account and conversation seeded: ${conversation.id}`);
    }
    console.log('🎉 Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
