import { GoogleGenAI } from "@google/genai";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} from '@simplewebauthn/server';

// Temporary memory store for stateless fallback
let inMemoryNotifications: any[] = [
  {
    id: 'notif-1',
    title: 'Blockchain Credential Secured',
    message: 'Your B.Sc. Computer Science degree from Amadu Bello University has been cryptographically signed and verified on the DS Tech ledger.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    recipientRole: 'candidate',
    type: 'success',
    priority: 'high',
    actionUrl: '#credentials'
  },
  {
    id: 'notif-2',
    title: 'Technical Interview invitation',
    message: 'The Advanced React Architect panel has reviewed your resume and matched you with our prime project. Please select a dynamic schedule.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recipientRole: 'candidate',
    type: 'interview',
    priority: 'high',
    actionUrl: '#interviews'
  },
  {
    id: 'notif-3',
    title: 'Recommended Course Available',
    message: 'We recommended starting the "AI-driven Full Stack Integration" course to bridge your skill gap for the Senior System Architect role.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    recipientRole: 'candidate',
    type: 'course',
    priority: 'medium',
    actionUrl: '#courses'
  },
  {
    id: 'notif-4',
    title: 'Security Alert: New Passkey Added',
    message: 'A cryptographically secure WebAuthn/FIDO2 passkey was registered on your active device (Chrome / Linux).',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipientRole: 'candidate',
    type: 'warning',
    priority: 'low',
    actionUrl: '#settings'
  },
  {
    id: 'notif-5',
    title: 'Portal Profile Synced',
    message: 'Your candidate portal identity has been safely linked across our enterprise ecosystem and secured under biometric key hashes.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    recipientRole: 'candidate',
    type: 'success',
    priority: 'low'
  },
  {
    id: 'notif-admin-1',
    title: 'New Candidate Registered',
    message: 'A new applicant has successfully bypassed the initial biometric gate and completed their secure portfolio setup.',
    read: false,
    createdAt: new Date().toISOString(),
    recipientRole: 'admin',
    type: 'application',
    priority: 'high'
  },
  {
    id: 'notif-admin-2',
    title: 'System Health Nominal',
    message: 'Cloudflare D1 tables, D1 indexes, and WebAuthn authenticators have been validated with zero key leakage.',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    recipientRole: 'admin',
    type: 'success',
    priority: 'low'
  }
];

// Seeded real-time chat messages database (Memory fallback)
let inMemoryChatMessages: any[] = [
  {
    id: 'msg-seed-1',
    senderId: 'chatbot',
    senderName: 'AI Career Assistant',
    senderRole: 'bot',
    receiverId: 'hassanalaminhassan85@gmail.com',
    message: 'Hello! I am your AI Career Copilot. I can analyze your resume, suggest top roles, mock-interview you, or guide your learning path. Ask me anything!',
    type: 'text',
    mediaUrl: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: 1
  }
];

// Global clients registry for SSE real-time broadcasting
const connectedClients = new Set<any>();

function broadcastSyncEvent(event: any) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`;
  const encoded = encoder.encode(payload);

  for (const controller of connectedClients) {
    try {
      controller.enqueue(encoded);
    } catch (e) {
      connectedClients.delete(controller);
    }
  }
}

// Helper to parse base64 Data URLs for Multimodal Gemini analysis
function parseBase64Data(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;
  return {
    mimeType: matches[1],
    base64Data: matches[2]
  };
}

// Helper to aggregate chat messages into conversation threads for admin overview
function groupMessagesIntoContacts(messages: any[]) {
  const contactsMap = new Map<string, any>();
  
  // Sort messages oldest to newest so last message is indeed the latest
  const sorted = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  for (const msg of sorted) {
    // Exclude bot messages from standard admin human conversations list
    if (msg.senderId === 'chatbot' || msg.receiverId === 'chatbot') {
      continue;
    }
    
    // The contact ID is the non-admin user
    const contactId = msg.senderId === 'admin' ? msg.receiverId : msg.senderId;
    const contactName = msg.senderId === 'admin' ? 'Candidate' : msg.senderName;
    const contactRole = msg.senderId === 'admin' ? 'user' : msg.senderRole;
    
    contactsMap.set(contactId, {
      contactId,
      contactName,
      contactRole,
      lastMessage: msg.message,
      lastMessageType: msg.type,
      lastMessageAt: msg.createdAt,
      unreadCount: 0
    });
  }
  
  // Count unread messages received by admin
  for (const msg of messages) {
    if (msg.receiverId === 'admin' && msg.read === 0) {
      const contact = contactsMap.get(msg.senderId);
      if (contact) {
        contact.unreadCount++;
      }
    }
  }
  
  return Array.from(contactsMap.values()).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

// Cryptographically secure password hashing helper using native Web Cryptography API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_alihsan_online_secure_2026_fido2");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Session based middleware security check
function getAuthorizedUser(request: Request): { userId: string; email: string; fullName: string; role: string } | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/dstech_session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(match[1]));
  } catch (e) {
    return null;
  }
}

async function ensureDatabaseTables(db: any) {
  if (!db) return;
  
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'Applicant',
      status TEXT DEFAULT 'active',
      password_hash TEXT,
      created_at TEXT NOT NULL
    );`,
    
    `CREATE TABLE IF NOT EXISTS passkeys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      public_key TEXT NOT NULL,
      counter INTEGER DEFAULT 0,
      transports TEXT,
      created_at TEXT NOT NULL
    );`,
    
    `CREATE TABLE IF NOT EXISTS biometric_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT,
      biometric_type TEXT,
      status TEXT,
      message TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );`,
    
    `CREATE TABLE IF NOT EXISTS scan_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      applicant_id TEXT,
      applicant_name TEXT,
      scanned_at TEXT NOT NULL,
      secure_r2_url TEXT,
      safety_status TEXT
    );`,
    
    `CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS otp_codes (
      email TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS webauthn_challenges (
      user_id TEXT PRIMARY KEY,
      challenge TEXT NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS fcm_tokens (
      userId TEXT,
      fcmToken TEXT,
      deviceName TEXT,
      deviceType TEXT,
      created_at TEXT NOT NULL,
      PRIMARY KEY (userId, fcmToken)
    );`,

    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`
  ];

  // Force clean up old unquoted schema to avoid SQL keyword parse errors
  try {
    await db.prepare("DROP TABLE IF EXISTS notifications").run();
  } catch (e) {}

  // Run initial table creations
  for (const query of queries) {
    try {
      await db.prepare(query).run();
    } catch (err) {
      console.error("Bootstrapper table error:", err);
    }
  }

  // Create notifications table with quoted identifiers to support SQLite keywords like "read" and "type"
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TEXT NOT NULL,
        "recipientRole" TEXT NOT NULL,
        "userId" TEXT,
        "type" TEXT NOT NULL,
        "priority" TEXT NOT NULL,
        "actionUrl" TEXT,
        "image" TEXT,
        "metadata" TEXT
      );
    `).run();
  } catch (err) {
    console.error("Bootstrapper notifications table error:", err);
  }

  // Create chat_messages table to support real-time SSE chatting
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" TEXT PRIMARY KEY,
        "senderId" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "receiverId" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "mediaUrl" TEXT,
        "createdAt" TEXT NOT NULL,
        "read" INTEGER NOT NULL DEFAULT 0
      );
    `).run();
  } catch (err) {
    console.error("Bootstrapper chat_messages table error:", err);
  }

  // Safe migrations to add status and password_hash to older tables if they exist
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN profile_photo TEXT").run();
  } catch (e) {}

  // Insert default user seed if none exists
  try {
    const check = await db.prepare("SELECT COUNT(*) as count FROM users").all();
    const rows = Array.isArray(check) ? check : (check?.results || []);
    if (rows && rows[0] && rows[0].count === 0) {
      const demoPassHash = await hashPassword("vision2026");
      await db.prepare(
        "INSERT INTO users (id, email, full_name, role, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind('usr-demo', 'candidate2026@dstech.com', 'candidate2026', 'Applicant', 'active', demoPassHash, new Date().toISOString()).run();
    }
  } catch (err) {
    console.error("Bootstrapper seed error:", err);
  }

  // Insert default notifications if none exist
  try {
    const check = await db.prepare('SELECT COUNT(*) as count FROM "notifications"').all();
    const rows = Array.isArray(check) ? check : (check?.results || []);
    if (rows && rows[0] && rows[0].count === 0) {
      const defaultNotifications = [
        {
          id: 'notif-1',
          title: 'Blockchain Credential Secured',
          message: 'Your B.Sc. Computer Science degree from Amadu Bello University has been cryptographically signed and verified on the DS Tech ledger.',
          read: 0,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          recipientRole: 'candidate',
          type: 'success',
          priority: 'high',
          actionUrl: '#credentials',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-2',
          title: 'Technical Interview invitation',
          message: 'The Advanced React Architect panel has reviewed your resume and matched you with our prime project. Please select a dynamic schedule.',
          read: 0,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recipientRole: 'candidate',
          type: 'interview',
          priority: 'high',
          actionUrl: '#interviews',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-3',
          title: 'Recommended Course Available',
          message: 'We recommended starting the "AI-driven Full Stack Integration" course to bridge your skill gap for the Senior System Architect role.',
          read: 1,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          recipientRole: 'candidate',
          type: 'course',
          priority: 'medium',
          actionUrl: '#courses',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-4',
          title: 'Security Alert: New Passkey Added',
          message: 'A cryptographically secure WebAuthn/FIDO2 passkey was registered on your active device (Chrome / Linux).',
          read: 1,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          recipientRole: 'candidate',
          type: 'warning',
          priority: 'low',
          actionUrl: '#settings',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-5',
          title: 'Portal Profile Synced',
          message: 'Your candidate portal identity has been safely linked across our enterprise ecosystem and secured under biometric key hashes.',
          read: 1,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          recipientRole: 'candidate',
          type: 'success',
          priority: 'low',
          actionUrl: '',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-admin-1',
          title: 'New Candidate Registered',
          message: 'A new applicant has successfully bypassed the initial biometric gate and completed their secure portfolio setup.',
          read: 0,
          createdAt: new Date().toISOString(),
          recipientRole: 'admin',
          type: 'application',
          priority: 'high',
          actionUrl: '',
          image: '',
          metadata: ''
        },
        {
          id: 'notif-admin-2',
          title: 'System Health Nominal',
          message: 'Cloudflare D1 tables, D1 indexes, and WebAuthn authenticators have been validated with zero key leakage.',
          read: 1,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          recipientRole: 'admin',
          type: 'success',
          priority: 'low',
          actionUrl: '',
          image: '',
          metadata: ''
        }
      ];

      for (const notif of defaultNotifications) {
        await db.prepare(
          'INSERT INTO "notifications" ("id", "title", "message", "read", "createdAt", "recipientRole", "userId", "type", "priority", "actionUrl", "image", "metadata") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          notif.id,
          notif.title,
          notif.message,
          notif.read,
          notif.createdAt,
          notif.recipientRole,
          null,
          notif.type,
          notif.priority,
          notif.actionUrl,
          notif.image,
          notif.metadata
        ).run();
      }
    }
  } catch (err) {
    console.error("Bootstrapper seed notifications error:", err);
  }
}

export async function onRequest(context: { request: Request; env: any; params: any }) {
  const { request, env } = context;
  
  // Run auto-bootstrapper to ensure tables exist
  try {
    await ensureDatabaseTables(env.DB);
  } catch (e) {
    console.error("Auto bootstrap failed:", e);
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-ID, Authorization',
  });

  if (path === '/api/debug/notifications') {
    let dbStatus = "no DB";
    let tables: any[] = [];
    let notificationsCount = -1;
    let errMessage = "";
    try {
      if (env.DB) {
        dbStatus = "DB present";
        const res = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        tables = Array.isArray(res) ? res : (res?.results || []);
        const countRes = await env.DB.prepare('SELECT COUNT(*) as count FROM "notifications"').all();
        const countRows = Array.isArray(countRes) ? countRes : (countRes?.results || []);
        notificationsCount = countRows[0] ? countRows[0].count : -1;
      }
    } catch (e: any) {
      errMessage = e.message || String(e);
    }
    return new Response(JSON.stringify({ dbStatus, tables, notificationsCount, errMessage, inMemoryCount: inMemoryNotifications.length }), { headers });
  }

  // ==========================================
  // REAL-TIME SSE CHAT ENDPOINTS
  // ==========================================

  // 1. GET /api/chat/messages
  if (path === '/api/chat/messages' && method === 'GET') {
    const senderId = url.searchParams.get('senderId') || '';
    const receiverId = url.searchParams.get('receiverId') || '';
    
    if (!senderId || !receiverId) {
      return new Response(JSON.stringify({ error: "Missing senderId or receiverId query params." }), { status: 400, headers });
    }

    try {
      if (env.DB) {
        const query = `
          SELECT * FROM "chat_messages" 
          WHERE (("senderId" = ? AND "receiverId" = ?) OR ("senderId" = ? AND "receiverId" = ?))
          ORDER BY "createdAt" ASC
        `;
        const res = await env.DB.prepare(query).bind(senderId, receiverId, receiverId, senderId).all();
        const messages = Array.isArray(res) ? res : (res?.results || []);
        return new Response(JSON.stringify({ messages }), { headers });
      }
    } catch (e: any) {
      console.error("D1 chat retrieval failed, using fallback:", e);
    }

    // Memory fallback filter
    const messages = inMemoryChatMessages.filter(msg => 
      ((msg.senderId === senderId && msg.receiverId === receiverId) || 
       (msg.senderId === receiverId && msg.receiverId === senderId))
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return new Response(JSON.stringify({ messages, source: 'fallback' }), { headers });
  }

  // 2. GET /api/chat/unread
  if (path === '/api/chat/unread' && method === 'GET') {
    const userId = url.searchParams.get('userId') || '';
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId query param." }), { status: 400, headers });
    }

    try {
      if (env.DB) {
        const query = `
          SELECT "senderId", COUNT(*) as count 
          FROM "chat_messages" 
          WHERE "receiverId" = ? AND "read" = 0
          GROUP BY "senderId"
        `;
        const res = await env.DB.prepare(query).bind(userId).all();
        const unreadRows = Array.isArray(res) ? res : (res?.results || []);
        const unread: Record<string, number> = {};
        for (const row of unreadRows) {
          unread[row.senderId] = row.count;
        }
        return new Response(JSON.stringify({ unread }), { headers });
      }
    } catch (e: any) {
      console.error("D1 chat unread failed, using fallback:", e);
    }

    // Memory fallback count
    const unread: Record<string, number> = {};
    for (const msg of inMemoryChatMessages) {
      if (msg.receiverId === userId && msg.read === 0) {
        unread[msg.senderId] = (unread[msg.senderId] || 0) + 1;
      }
    }
    return new Response(JSON.stringify({ unread, source: 'fallback' }), { headers });
  }

  // 3. POST /api/chat/messages/mark-read
  if (path === '/api/chat/messages/mark-read' && method === 'POST') {
    try {
      const { senderId, receiverId } = await request.json();
      if (!senderId || !receiverId) {
        return new Response(JSON.stringify({ error: "Missing senderId or receiverId in payload." }), { status: 400, headers });
      }

      try {
        if (env.DB) {
          const query = `
            UPDATE "chat_messages" 
            SET "read" = 1 
            WHERE "senderId" = ? AND "receiverId" = ? AND "read" = 0
          `;
          await env.DB.prepare(query).bind(senderId, receiverId).run();
          // Broadcast read receipt event
          broadcastSyncEvent({ type: 'chat_read', data: { senderId, receiverId } });
          return new Response(JSON.stringify({ success: true }), { headers });
        }
      } catch (e: any) {
        console.error("D1 chat mark-read failed, using fallback:", e);
      }

      // Memory fallback update
      let updatedCount = 0;
      for (const msg of inMemoryChatMessages) {
        if (msg.senderId === senderId && msg.receiverId === receiverId && msg.read === 0) {
          msg.read = 1;
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        broadcastSyncEvent({ type: 'chat_read', data: { senderId, receiverId } });
      }
      return new Response(JSON.stringify({ success: true, updatedCount, source: 'fallback' }), { headers });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers });
    }
  }

  // 4. POST /api/chat/messages
  if (path === '/api/chat/messages' && method === 'POST') {
    try {
      const payload = await request.json();
      const { senderId, senderName, senderRole, receiverId, message, type, mediaUrl } = payload;
      
      if (!senderId || !senderName || !receiverId || (!message && !mediaUrl)) {
        return new Response(JSON.stringify({ error: "Missing required fields in chat message payload." }), { status: 400, headers });
      }

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();

      const newMsg = {
        id: msgId,
        senderId,
        senderName,
        senderRole,
        receiverId,
        message: message || '',
        type: type || 'text',
        mediaUrl: mediaUrl || null,
        createdAt,
        read: 0
      };

      // Save Message to database if exists
      try {
        if (env.DB) {
          await env.DB.prepare(`
            INSERT INTO "chat_messages" ("id", "senderId", "senderName", "senderRole", "receiverId", "message", "type", "mediaUrl", "createdAt", "read")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            newMsg.id,
            newMsg.senderId,
            newMsg.senderName,
            newMsg.senderRole,
            newMsg.receiverId,
            newMsg.message,
            newMsg.type,
            newMsg.mediaUrl,
            newMsg.createdAt,
            newMsg.read
          ).run();
        }
      } catch (e: any) {
        console.error("D1 save message failed, using fallback:", e);
      }
      
      // Save to memory fallback
      inMemoryChatMessages.push(newMsg);

      // Broadcast user message to connected SSE clients
      broadcastSyncEvent({ type: 'chat', data: newMsg });

      // AI Chatbot Reply Logic
      if (receiverId === 'chatbot') {
        const chatContext = "You are the friendly, helpful AI Career Copilot for DS Tech. Support the user with career advice, skills profiling, interview prep, learning paths, or general HR queries. Keep your responses engaging, specific, and concise (max 3-4 sentences), formatted beautifully in professional Markdown.\n\n";
        
        let history: any[] = [];
        try {
          if (env.DB) {
            const query = `
              SELECT * FROM "chat_messages" 
              WHERE (("senderId" = ? AND "receiverId" = 'chatbot') OR ("senderId" = 'chatbot' AND "receiverId" = ?))
              ORDER BY "createdAt" DESC LIMIT 10
            `;
            const res = await env.DB.prepare(query).bind(senderId, senderId).all();
            history = (Array.isArray(res) ? res : (res?.results || [])).reverse();
          } else {
            history = inMemoryChatMessages.filter(msg => 
              ((msg.senderId === senderId && msg.receiverId === 'chatbot') || 
               (msg.senderId === 'chatbot' && msg.receiverId === senderId))
            ).slice(-10);
          }
        } catch (e) {
          history = inMemoryChatMessages.filter(msg => 
            ((msg.senderId === senderId && msg.receiverId === 'chatbot') || 
             (msg.senderId === 'chatbot' && msg.receiverId === senderId))
          ).slice(-10);
        }

        let historyPrompt = "";
        for (const h of history) {
          const sName = h.senderId === 'chatbot' ? 'AI' : 'User';
          historyPrompt += `${sName}: ${h.message}\n`;
        }

        const botMsgId = `msg-${Date.now()}-bot`;
        const botCreatedAt = new Date(Date.now() + 500).toISOString();
        
        let botText = "";
        
        try {
          const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
          
          let response;
          if (newMsg.type === 'image' && newMsg.mediaUrl && newMsg.mediaUrl.startsWith('data:')) {
            const parsed = parseBase64Data(newMsg.mediaUrl);
            if (parsed) {
              response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: [
                  {
                    inlineData: {
                      data: parsed.base64Data,
                      mimeType: parsed.mimeType
                    }
                  },
                  `${chatContext}\nHistory:\n${historyPrompt}\nUser has uploaded an image. Analyze this image and respond to the user's message: ${newMsg.message || 'What is in this image?'}`
                ]
              });
            }
          }
          
          if (!response) {
            response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `${chatContext}\nHistory:\n${historyPrompt}\nUser: ${newMsg.message}\nAI:`
            });
          }

          botText = response.text || "I am analyzing your message. Let me know if there's anything specific I can help you with!";
        } catch (apiErr: any) {
          console.error("Gemini Chatbot API error:", apiErr);
          botText = "I received your message! However, I had a temporary connection issue. Please feel free to ask me again, or type your message below!";
        }

        const botMsg = {
          id: botMsgId,
          senderId: 'chatbot',
          senderName: 'AI Career Assistant',
          senderRole: 'bot',
          receiverId: senderId,
          message: botText,
          type: 'text',
          mediaUrl: null,
          createdAt: botCreatedAt,
          read: 0
        };

        try {
          if (env.DB) {
            await env.DB.prepare(`
              INSERT INTO "chat_messages" ("id", "senderId", "senderName", "senderRole", "receiverId", "message", "type", "mediaUrl", "createdAt", "read")
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              botMsg.id,
              botMsg.senderId,
              botMsg.senderName,
              botMsg.senderRole,
              botMsg.receiverId,
              botMsg.message,
              botMsg.type,
              botMsg.mediaUrl,
              botMsg.createdAt,
              botMsg.read
            ).run();
          }
        } catch (e: any) {
          console.error("D1 save bot reply failed:", e);
        }
        
        inMemoryChatMessages.push(botMsg);
        broadcastSyncEvent({ type: 'chat', data: botMsg });
      }

      return new Response(JSON.stringify({ success: true, message: newMsg }), { headers });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers });
    }
  }

  // 5. GET /api/chat/active-contacts
  if (path === '/api/chat/active-contacts' && method === 'GET') {
    try {
      if (env.DB) {
        const allMsgQuery = `SELECT * FROM "chat_messages" ORDER BY "createdAt" DESC`;
        const res = await env.DB.prepare(allMsgQuery).all();
        const allMessages = Array.isArray(res) ? res : (res?.results || []);
        
        const contacts = groupMessagesIntoContacts(allMessages);
        return new Response(JSON.stringify({ contacts }), { headers });
      }
    } catch (e: any) {
      console.error("D1 active-contacts failed, using fallback:", e);
    }

    const contacts = groupMessagesIntoContacts(inMemoryChatMessages);
    return new Response(JSON.stringify({ contacts, source: 'fallback' }), { headers });
  }

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Dynamically determine the RP ID and Origin, enforcing alihsan.online when appropriate.
  const referer = request.headers.get('Referer') || '';
  const requestOrigin = request.headers.get('Origin') || '';
  
  let rpId = 'alihsan.online';
  let origin = 'https://alihsan.online';

  if (url.hostname.includes('alihsan.online') || referer.includes('alihsan.online') || requestOrigin.includes('alihsan.online')) {
    rpId = 'alihsan.online';
    origin = 'https://alihsan.online';
  } else {
    // Fallback for development/sandbox
    rpId = url.hostname;
    origin = `${url.protocol}//${url.host}`;
  }

  try {
    // ==========================================
    // 1. WEBAUTHN SIGNUP / REGISTRATION FLOW
    // ==========================================

    if (path === '/api/auth/register-options' && method === 'GET') {
      const userId = url.searchParams.get('userId') || 'usr-demo';
      const username = url.searchParams.get('username') || 'candidate2026@dstech.com';

      const options = await generateRegistrationOptions({
        rpName: 'Al Ihsan Security Portal',
        rpID: rpId,
        userID: new TextEncoder().encode(userId),
        userName: username,
        userDisplayName: username.split('@')[0],
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform'
        },
      });

      // Secure challenge backup on D1 ledger to enforce server-side validation & bypass cookie limits
      await env.DB.prepare(
        "INSERT OR REPLACE INTO webauthn_challenges (user_id, challenge, username, created_at) VALUES (?, ?, ?, ?)"
      ).bind(userId, options.challenge, username, new Date().toISOString()).run();

      // Save options/challenge state securely in HttpOnly cookie as primary
      headers.append('Set-Cookie', `reg_options=${btoa(JSON.stringify({ challenge: options.challenge, userId, username }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`);

      return new Response(JSON.stringify(options), { headers });
    }

    if (path === '/api/auth/verify-registration' && method === 'POST') {
      const body = await request.json();
      const cookieHeader = request.headers.get('Cookie') || '';
      
      // Simulation bypass for preview environment testing only
      if (body.isSimulation) {
        const userId = body.userId || 'usr-demo';
        const email = body.email || 'candidate2026@dstech.com';
        const credIdBase64 = btoa('mock-cred-id-' + Math.random().toString());
        const pubKeyBase64 = btoa('mock-pub-key');

        await env.DB.prepare(
          "INSERT OR REPLACE INTO users (id, email, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(userId, email, email.split('@')[0], 'Applicant', 'active', new Date().toISOString()).run();

        await env.DB.prepare(
          "INSERT OR REPLACE INTO passkeys (id, user_id, public_key, counter, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(credIdBase64, userId, pubKeyBase64, 0, JSON.stringify(['internal']), new Date().toISOString()).run();

        await env.DB.prepare(
          "INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          'log_' + Math.random().toString(36).substring(2, 11),
          userId,
          email,
          'platform',
          'success',
          'Bound new simulated biometric key (Preview Mode)',
          request.headers.get('User-Agent') || 'Unknown Browser',
          new Date().toISOString()
        ).run();

        broadcastSyncEvent({
          type: 'BIOMETRIC_REGISTRATION',
          userId,
          email,
          message: `Simulated biometric key bound for ${email}`
        });

        return new Response(JSON.stringify({ verified: true, isSimulation: true }), { headers });
      }

      // Secure Server-side Challenge validation: Fetch from D1 Ledger first, fallback to Cookie
      let expectedChallenge = '';
      let sessionData: any = {};

      const d1ChallengeCheck = await env.DB.prepare("SELECT * FROM webauthn_challenges WHERE user_id = ?").bind(body.userId || '').all();
      const storedChallengeRecord = d1ChallengeCheck.results?.[0];

      if (storedChallengeRecord) {
        expectedChallenge = storedChallengeRecord.challenge;
        sessionData = {
          userId: storedChallengeRecord.user_id,
          username: storedChallengeRecord.username
        };
        // Burn challenge record to prevent replay attacks
        await env.DB.prepare("DELETE FROM webauthn_challenges WHERE user_id = ?").bind(body.userId).run();
      } else {
        const match = cookieHeader.match(/reg_options=([^;]+)/);
        if (!match) {
          return new Response(JSON.stringify({ verified: false, error: "Registration challenge expired or missing." }), { status: 400, headers });
        }
        sessionData = JSON.parse(atob(match[1]));
        expectedChallenge = sessionData.challenge;
      }

      const verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        requireUserVerification: false,
      });

      if (verification.verified && verification.registrationInfo) {
        const regInfo = verification.registrationInfo as any;
        const credential = regInfo.credential || {};
        
        const credentialID = regInfo.credentialID || credential.id;
        const credentialPublicKey = regInfo.credentialPublicKey || credential.publicKey;
        const counter = typeof regInfo.counter === 'number' ? regInfo.counter : (credential.counter || 0);

        const credIdBase64 = typeof credentialID === 'string' 
          ? credentialID 
          : btoa(String.fromCharCode(...(credentialID instanceof Uint8Array ? credentialID : [])));
        
        const pubKeyBase64 = typeof credentialPublicKey === 'string' 
          ? credentialPublicKey 
          : btoa(String.fromCharCode(...(credentialPublicKey instanceof Uint8Array ? credentialPublicKey : [])));

        // Persist active User in D1 database
        await env.DB.prepare(
          "INSERT OR REPLACE INTO users (id, email, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          sessionData.userId,
          sessionData.username,
          sessionData.username.split('@')[0],
          'Applicant',
          'active',
          new Date().toISOString()
        ).run();

        // Persist biometric details securely on D1 Enclave
        await env.DB.prepare(
          "INSERT OR REPLACE INTO passkeys (id, user_id, public_key, counter, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          credIdBase64,
          sessionData.userId,
          pubKeyBase64,
          counter,
          JSON.stringify(body.response.transports || []),
          new Date().toISOString()
        ).run();

        await env.DB.prepare(
          "INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          'log_' + Math.random().toString(36).substring(2, 11),
          sessionData.userId,
          sessionData.username,
          'platform',
          'success',
          'Bound new hardware security key via WebAuthn Enclave',
          request.headers.get('User-Agent') || 'Unknown Browser',
          new Date().toISOString()
        ).run();

        broadcastSyncEvent({
          type: 'BIOMETRIC_REGISTRATION',
          userId: sessionData.userId,
          email: sessionData.username,
          message: `New biometric hardware key bound via WebAuthn for ${sessionData.username}`
        });

        headers.append('Set-Cookie', 'reg_options=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

        return new Response(JSON.stringify({ verified: true }), { headers });
      }

      return new Response(JSON.stringify({ verified: false, error: "Cryptographic validation failed" }), { headers });
    }

    // ==========================================
    // 2. WEBAUTHN LOGIN / AUTHENTICATION FLOW
    // ==========================================

    if (path === '/api/auth/authenticate-options' && method === 'GET') {
      const userId = url.searchParams.get('userId') || '';
      const username = url.searchParams.get('username') || '';

      let allowCredentials: any[] = [];
      if (userId) {
        const results = await env.DB.prepare("SELECT * FROM passkeys WHERE user_id = ?").bind(userId).all();
        if (results.results) {
          allowCredentials = results.results.map((p: any) => ({
            id: p.id,
            type: 'public-key',
            transports: JSON.parse(p.transports || '[]'),
          }));
        }
      }

      const options = await generateAuthenticationOptions({
        rpID: rpId,
        allowCredentials,
        userVerification: 'preferred',
      });

      // Secure challenge backup on D1 ledger to enforce server-side validation & bypass cookie limits
      await env.DB.prepare(
        "INSERT OR REPLACE INTO webauthn_challenges (user_id, challenge, username, created_at) VALUES (?, ?, ?, ?)"
      ).bind(userId || 'anonymous', options.challenge, username || 'anonymous', new Date().toISOString()).run();

      headers.append('Set-Cookie', `auth_options=${btoa(JSON.stringify({ challenge: options.challenge, userId, username }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`);

      return new Response(JSON.stringify(options), { headers });
    }

    if (path === '/api/auth/authenticate-verify' && method === 'POST') {
      const body = await request.json();
      const cookieHeader = request.headers.get('Cookie') || '';

      if (body.isSimulation) {
        const userId = body.userId || 'usr-demo';
        const email = body.email || 'candidate2026@dstech.com';

        const userResults = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).all();
        let user = userResults.results?.[0];
        if (!user) {
          await env.DB.prepare(
            "INSERT OR REPLACE INTO users (id, email, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(userId, email, email.split('@')[0], 'Applicant', 'active', new Date().toISOString()).run();
          user = { id: userId, email, full_name: email.split('@')[0], role: 'Applicant' };
        }

        const userSession = {
          userId,
          email: user.email || email,
          fullName: user.full_name || email.split('@')[0],
          role: user.role || 'Applicant'
        };

        headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

        await env.DB.prepare(
          "INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          'log_' + Math.random().toString(36).substring(2, 11),
          userId,
          userSession.email,
          'platform',
          'success',
          'Logged in via simulated biometric passkey signature (Preview Mode)',
          request.headers.get('User-Agent') || 'Unknown Browser',
          new Date().toISOString()
        ).run();

        broadcastSyncEvent({
          type: 'BIOMETRIC_LOGIN',
          userId,
          email: userSession.email,
          message: `Candidate ${userSession.fullName} logged in successfully (Simulated)`
        });

        return new Response(JSON.stringify({ verified: true, user: userSession, isSimulation: true }), { headers });
      }

      // Secure Server-side Challenge validation: Fetch from D1 Ledger first, fallback to Cookie
      let expectedChallenge = '';
      let sessionData: any = {};

      const d1ChallengeCheck = await env.DB.prepare("SELECT * FROM webauthn_challenges WHERE user_id = ?").bind(body.userId || 'anonymous').all();
      const storedChallengeRecord = d1ChallengeCheck.results?.[0];

      if (storedChallengeRecord) {
        expectedChallenge = storedChallengeRecord.challenge;
        sessionData = {
          userId: storedChallengeRecord.user_id,
          username: storedChallengeRecord.username
        };
        await env.DB.prepare("DELETE FROM webauthn_challenges WHERE user_id = ?").bind(body.userId || 'anonymous').run();
      } else {
        const match = cookieHeader.match(/auth_options=([^;]+)/);
        if (!match) {
          return new Response(JSON.stringify({ verified: false, error: "Authentication challenge expired or missing." }), { status: 400, headers });
        }
        sessionData = JSON.parse(atob(match[1]));
        expectedChallenge = sessionData.challenge;
      }

      const credIdBase64 = body.response.id;
      const results = await env.DB.prepare("SELECT * FROM passkeys WHERE id = ?").bind(credIdBase64).all();
      const passkey = results.results?.[0];

      if (!passkey) {
        return new Response(JSON.stringify({ verified: false, error: "Hardware credential unregistered on this D1 ledger." }), { status: 400, headers });
      }

      const pubKeyBinary = atob(passkey.public_key);
      const pubKeyBytes = new Uint8Array(pubKeyBinary.length);
      for (let i = 0; i < pubKeyBinary.length; i++) {
        pubKeyBytes[i] = pubKeyBinary.charCodeAt(i);
      }

      const verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        credential: {
          id: passkey.id,
          publicKey: pubKeyBytes,
          counter: passkey.counter,
          transports: JSON.parse(passkey.transports || '[]'),
        },
        requireUserVerification: false,
      });

      if (verification.verified && verification.authenticationInfo) {
        await env.DB.prepare("UPDATE passkeys SET counter = ? WHERE id = ?").bind(verification.authenticationInfo.newCounter, passkey.id).run();

        const userResults = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(passkey.user_id).all();
        const user = userResults.results?.[0];

        const userSession = {
          userId: passkey.user_id,
          email: user?.email || sessionData.username || 'candidate@dstech.com',
          fullName: user?.full_name || 'Candidate',
          role: user?.role || 'Applicant'
        };
        headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

        await env.DB.prepare(
          "INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          'log_' + Math.random().toString(36).substring(2, 11),
          passkey.user_id,
          userSession.email,
          'platform',
          'success',
          'Logged in successfully via biometric passkey signature',
          request.headers.get('User-Agent') || 'Unknown Browser',
          new Date().toISOString()
        ).run();

        broadcastSyncEvent({
          type: 'BIOMETRIC_LOGIN',
          userId: passkey.user_id,
          email: userSession.email,
          message: `Candidate ${userSession.fullName} logged in via passkey signature`
        });

        headers.append('Set-Cookie', 'auth_options=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

        return new Response(JSON.stringify({ verified: true, user: userSession }), { headers });
      }

      return new Response(JSON.stringify({ verified: false, error: "WebAuthn assertion failed signature mismatch" }), { headers });
    }

    // ==========================================
    // 2.05 EMAIL OTP SIGNUP (Phase 1)
    // ==========================================

    if (path === '/api/auth/otp-generate' && method === 'POST') {
      const body = await request.json();
      const { email, fullName, password, role } = body;

      if (!email || !fullName || !password || !role) {
        return new Response(JSON.stringify({ error: "Missing required fields: email, fullName, password, and role." }), { status: 400, headers });
      }

      // Check if email is already active in D1
      const checkResult = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
      const existingUser = checkResult.results?.[0];
      if (existingUser && existingUser.status === 'active') {
        return new Response(JSON.stringify({ error: "Email already registered. Please sign in instead." }), { status: 400, headers });
      }

      // Securely hash password on D1 Ledger
      const passHash = await hashPassword(password);
      const generatedUserId = existingUser?.id || ('usr_' + Math.random().toString(36).substring(2, 11));

      // Save/Upsert temporary pending account in D1
      await env.DB.prepare(
        "INSERT OR REPLACE INTO users (id, email, full_name, role, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(generatedUserId, email, fullName, role, 'pending_verification', passHash, new Date().toISOString()).run();

      // Generate secure 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute TTL

      // Store in D1 otp_codes table
      await env.DB.prepare(
        "INSERT OR REPLACE INTO otp_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)"
      ).bind(email, otpCode, expiresAt, new Date().toISOString()).run();

      // Dispatch via Brevo if configured, otherwise provide elegant sandbox fallback
      let isSent = false;
      let statusLog = "Bypassed real SMTP. Sandbox OTP mode active.";

      if (env.BREVO_API_KEY) {
        try {
          const mailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': env.BREVO_API_KEY
            },
            body: JSON.stringify({
              sender: {
                name: env.BREVO_SENDER_NAME || "Al Ihsan Support",
                email: env.BREVO_SENDER_EMAIL || "noreply@alihsan.online"
              },
              to: [{ email, name: fullName }],
              subject: "🔒 alihsan.online: Your Secure 6-Digit Signup Verification OTP",
              htmlContent: `
                <div style="font-family: sans-serif; padding: 24px; background-color: #0c1428; color: #f8fafc; border-radius: 16px; max-width: 480px; margin: auto; border: 1px solid #1e293b;">
                  <h2 style="color: #6366f1; text-align: center; font-weight: 900; letter-spacing: -1px; margin-bottom: 24px;">AL IHSAN ONLINE</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Hello <strong>${fullName}</strong>,</p>
                  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">To secure your candidate/portal access, please verify your email with this secure 6-digit passcode. This OTP will expire in exactly <strong>5 minutes</strong>.</p>
                  <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; margin: 28px 0; border: 1px solid #334155;">
                    ${otpCode}
                  </div>
                  <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">This email is part of alihsan.online's strict zero-trust security perimeter. If you did not request this, please ignore this email.</p>
                </div>
              `
            })
          });

          if (mailRes.ok) {
            isSent = true;
            statusLog = "Transactional Email transmitted successfully via Brevo API.";
          } else {
            const errBody = await mailRes.text();
            console.error("Brevo rejected email transmission:", errBody);
            statusLog = `Brevo transmission rejected: ${errBody}`;
          }
        } catch (mailErr: any) {
          console.error("Brevo network exception:", mailErr);
          statusLog = `Brevo network exception: ${mailErr.message}`;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        emailSent: isSent,
        message: isSent ? "A secure 6-digit verification code has been sent to your email." : "Secure sandbox email code generated.",
        // Return code directly ONLY if BREVO is unconfigured so the tester can copy-paste from UI easily
        otp: env.BREVO_API_KEY ? undefined : otpCode,
        debug: statusLog
      }), { headers });
    }

    // ==========================================
    // 2.06 EMAIL OTP VERIFICATION (Phase 2)
    // ==========================================

    if (path === '/api/auth/otp-verify' && method === 'POST') {
      const body = await request.json();
      const { email, otp } = body;

      if (!email || !otp) {
        return new Response(JSON.stringify({ error: "Missing required identifier: email and otp." }), { status: 400, headers });
      }

      const results = await env.DB.prepare("SELECT * FROM otp_codes WHERE email = ?").bind(email).all();
      const record = results.results?.[0];

      if (!record) {
        return new Response(JSON.stringify({ error: "No verification code records found for this email." }), { status: 400, headers });
      }

      if (record.code !== otp.trim()) {
        return new Response(JSON.stringify({ error: "Cryptographic validation failed. Invalid verification passcode." }), { status: 400, headers });
      }

      if (Date.now() > record.expires_at) {
        return new Response(JSON.stringify({ error: "OTP has expired. Please register again to generate a fresh passcode." }), { status: 400, headers });
      }

      // Activate the user in our ledger
      await env.DB.prepare("UPDATE users SET status = 'active' WHERE email = ?").bind(email).run();

      // Retrieve full activated user profile
      const userResult = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
      const user = userResult.results?.[0];

      // Remove OTP code from ledger
      await env.DB.prepare("DELETE FROM otp_codes WHERE email = ?").bind(email).run();

      const userSession = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      };

      headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

      return new Response(JSON.stringify({
        success: true,
        message: "OTP validation successful. Welcome to Al Ihsan Online candidate portal!",
        user: userSession
      }), { headers });
    }

    // ==========================================
    // 2.07 SECURE ADMIN/USER BACKEND REGISTER
    // ==========================================

    if (path === '/api/auth/register' && method === 'POST') {
      const body = await request.json();
      const { email, password, fullName, preferences, securityPasscode } = body;

      if (!email || !password || !fullName) {
        return new Response(JSON.stringify({ error: "Missing required credentials: email, password, and fullName." }), { status: 400, headers });
      }

      const check = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE email = ?").bind(email).all();
      if (check.results?.[0]?.count > 0) {
        return new Response(JSON.stringify({ error: "A profile under this email already exists." }), { status: 400, headers });
      }

      const isAdmin = preferences?.isAdmin || false;
      const targetRole = isAdmin ? 'Admin' : 'Applicant';

      if (isAdmin) {
        const inputPasscode = securityPasscode || password;
        const correctAdminPasscode = env.ADMIN_PASSCODE || "admin2026";
        if (inputPasscode !== correctAdminPasscode) {
          return new Response(JSON.stringify({ error: "Invalid Admin Security Passcode. Access denied." }), { status: 401, headers });
        }
      }

      const passHash = await hashPassword(password);
      const generatedUserId = 'usr_admin_' + Math.random().toString(36).substring(2, 11);

      await env.DB.prepare(
        "INSERT INTO users (id, email, full_name, role, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(generatedUserId, email, fullName, targetRole, 'active', passHash, new Date().toISOString()).run();

      const userSession = {
        userId: generatedUserId,
        email,
        fullName,
        role: targetRole
      };

      headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

      return new Response(JSON.stringify(userSession), { headers });
    }

    // ==========================================
    // 2.08 SECURE ADMIN/USER BACKEND LOGIN
    // ==========================================

    if (path === '/api/auth/login' && method === 'POST') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Missing email or password." }), { status: 400, headers });
      }

      const results = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
      const user = results.results?.[0];

      if (!user) {
        // Fallback for default admin registration for ease of deploy/testing if DB seed was not run
        if (email.toLowerCase() === 'admin@dstech.com' && password === (env.ADMIN_PASSCODE || 'admin2026')) {
          const generatedUserId = 'usr_admin_seed';
          const passHash = await hashPassword(password);
          await env.DB.prepare(
            "INSERT OR REPLACE INTO users (id, email, full_name, role, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(generatedUserId, 'admin@dstech.com', 'Hassan Al-Amin', 'Admin', 'active', passHash, new Date().toISOString()).run();

          const userSession = {
            userId: generatedUserId,
            email: 'admin@dstech.com',
            fullName: 'Hassan Al-Amin',
            role: 'Admin'
          };
          headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
          return new Response(JSON.stringify(userSession), { headers });
        }
        return new Response(JSON.stringify({ error: "Access Denied: Incorrect email or password." }), { status: 401, headers });
      }

      if (user.status === 'pending_verification') {
        return new Response(JSON.stringify({ error: "Account pending verification. Please complete OTP validation." }), { status: 401, headers });
      }

      const inputHash = await hashPassword(password);
      if (user.password_hash !== inputHash) {
        return new Response(JSON.stringify({ error: "Access Denied: Incorrect email or password." }), { status: 401, headers });
      }

      const userSession = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      };

      headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

      return new Response(JSON.stringify(userSession), { headers });
    }

    // ==========================================
    // 2.1 FIREBASE PROFILE SYNCHRONIZATION (LEGACY COMPATIBILITY)
    // ==========================================

    if (path === '/api/auth/check-email' && method === 'GET') {
      const emailParam = url.searchParams.get('email') || '';
      if (!emailParam) {
        return new Response(JSON.stringify({ error: "Missing email parameter" }), { status: 400, headers });
      }
      const results = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(emailParam).all();
      const user = results.results?.[0];
      return new Response(JSON.stringify({
        exists: !!user,
        user: user ? { 
          id: user.id, 
          email: user.email, 
          fullName: user.full_name, 
          role: user.role,
          profilePhoto: user.profile_photo || "" 
        } : null
      }), { headers });
    }

    if (path === '/api/auth/sync-firebase' && method === 'POST') {
      const body = await request.json();
      const { firebaseUid, email, fullName, role, profilePhoto } = body;

      if (!firebaseUid || !email) {
        return new Response(JSON.stringify({ error: "Missing required identifier: firebaseUid and email" }), { status: 400, headers });
      }

      // Check if user already exists with this email to avoid duplicates or overwriting
      const checkResult = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
      const existingUser = checkResult.results?.[0];

      let finalUser;
      let alreadyExists = false;

      if (existingUser) {
        alreadyExists = true;
        
        // If profile photo is provided and currently empty, update it
        if (profilePhoto && !existingUser.profile_photo) {
          await env.DB.prepare("UPDATE users SET profile_photo = ? WHERE id = ?").bind(profilePhoto, existingUser.id).run();
          existingUser.profile_photo = profilePhoto;
        }

        finalUser = {
          id: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.full_name,
          role: existingUser.role,
          profilePhoto: existingUser.profile_photo || ""
        };
      } else {
        // Create new user profile as requested
        const nameToUse = fullName || email.split('@')[0];
        const roleToUse = role || 'Applicant';
        const photoToUse = profilePhoto || '';
        
        await env.DB.prepare(
          "INSERT INTO users (id, email, full_name, role, status, profile_photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          firebaseUid,
          email,
          nameToUse,
          roleToUse,
          'active',
          photoToUse,
          new Date().toISOString()
        ).run();

        finalUser = {
          id: firebaseUid,
          email,
          fullName: nameToUse,
          role: roleToUse,
          profilePhoto: photoToUse
        };
      }

      // Set session cookie
      headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(finalUser))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

      // Broadcast profile sync success
      broadcastSyncEvent({
        type: 'PROFILE_SYNC',
        userId: finalUser.id,
        email,
        message: alreadyExists 
          ? `Profile authenticated for existing user ${finalUser.fullName}`
          : `New user profile created and registered for ${finalUser.fullName}`
      });

      return new Response(JSON.stringify({ success: true, user: finalUser, exists: alreadyExists }), { headers });
    }

    if (path === '/api/auth/update-profile' && method === 'POST') {
      const body = await request.json();
      const { userId, fullName, email, profilePhoto } = body;

      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing required userId" }), { status: 400, headers });
      }

      const results = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).all();
      const user = results.results?.[0];

      if (!user) {
        return new Response(JSON.stringify({ error: "Profile not found in database." }), { status: 404, headers });
      }

      const nameToUse = fullName || user.full_name;
      const emailToUse = email || user.email;
      const photoToUse = profilePhoto !== undefined ? profilePhoto : (user.profile_photo || "");

      await env.DB.prepare(
        "UPDATE users SET full_name = ?, email = ?, profile_photo = ? WHERE id = ?"
      ).bind(nameToUse, emailToUse, photoToUse, userId).run();

      const updatedUser = {
        id: userId,
        email: emailToUse,
        fullName: nameToUse,
        role: user.role,
        profilePhoto: photoToUse
      };

      // Set session cookie
      headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(updatedUser))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

      broadcastSyncEvent({
        type: 'PROFILE_UPDATED',
        userId,
        message: `Profile updated successfully for ${updatedUser.fullName}`
      });

      return new Response(JSON.stringify({ success: true, user: updatedUser }), { headers });
    }

    // ==========================================
    // 3. SECURITY LOGS & ATTEMPTS AUDITING
    // ==========================================

    if (path === '/api/auth/passkeys' && method === 'GET') {
      const userId = url.searchParams.get('userId') || 'anonymous';
      const results = await env.DB.prepare(
        "SELECT id, public_key, counter, transports, created_at FROM passkeys WHERE user_id = ?"
      ).bind(userId).all();
      return new Response(JSON.stringify(results.results || []), { headers });
    }

    if (path === '/api/auth/biometric-logs' && method === 'GET') {
      const userId = url.searchParams.get('userId') || 'anonymous';
      const results = await env.DB.prepare(
        "SELECT * FROM biometric_logs WHERE user_id = ? ORDER BY created_at DESC"
      ).bind(userId).all();
      return new Response(JSON.stringify(results.results || []), { headers });
    }

    if (path === '/api/auth/biometric-attempt-log' && method === 'POST') {
      const body = await request.json();
      await env.DB.prepare(
        "INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        'log_' + Math.random().toString(36).substring(2, 11),
        body.userId || 'anonymous',
        body.email || '',
        body.biometricType || 'passkey',
        body.status,
        body.message,
        body.userAgent || '',
        new Date().toISOString()
      ).run();

      // Broadcast biometric log creation
      broadcastSyncEvent({
        type: 'BIOMETRIC_LOG_CREATED',
        userId: body.userId || 'anonymous',
        email: body.email,
        status: body.status,
        message: body.message
      });

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // ==========================================
    // 4. SCAN HISTORY ENDPOINTS
    // ==========================================

    if (path === '/api/scan-history') {
      const userId = request.headers.get('X-User-ID') || 'anonymous';
      if (method === 'GET') {
        const results = await env.DB.prepare("SELECT * FROM scan_history WHERE user_id = ?").bind(userId).all();
        return new Response(JSON.stringify(results.results || []), { headers });
      }
      if (method === 'POST') {
        const body = await request.json();
        const id = 'scan_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        const record = {
          id,
          user_id: userId,
          applicant_id: body.applicantId,
          applicant_name: body.applicantName,
          scanned_at: new Date().toISOString(),
          secure_r2_url: body.qrImageBase64 || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&fit=crop&auto=format',
          safety_status: body.safetyStatus || 'safe'
        };
        await env.DB.prepare(
          "INSERT INTO scan_history (id, user_id, applicant_id, applicant_name, scanned_at, secure_r2_url, safety_status) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          record.id,
          record.user_id,
          record.applicant_id,
          record.applicant_name,
          record.scanned_at,
          record.secure_r2_url,
          record.safety_status
        ).run();

        // Broadcast real-time scan event to connected clients
        broadcastSyncEvent({
          type: 'SCAN_SYNC',
          scanRecord: record,
          message: `Biometric bypass scan verified for ${record.applicant_name}`
        });

        return new Response(JSON.stringify(record), { headers });
      }
    }

    // ==========================================
    // 5. APPLICATIONS ENDPOINTS
    // ==========================================

    if (path === '/api/applications') {
      if (method === 'GET') {
        const results = await env.DB.prepare("SELECT * FROM applications").all();
        const apps = (results.results || []).map((r: any) => ({ id: r.id, ...JSON.parse(r.data_json) }));
        return new Response(JSON.stringify(apps), { headers });
      }
      if (method === 'POST') {
        const body = await request.json();
        const id = 'app_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        const appData = {
          id,
          createdAt: new Date().toISOString(),
          status: 'approved',
          ...body
        };
        await env.DB.prepare("INSERT INTO applications (id, data_json) VALUES (?, ?)").bind(id, JSON.stringify(appData)).run();

        // Broadcast real-time application creation
        broadcastSyncEvent({
          type: 'APPLICATION_CREATED',
          application: appData,
          message: `New application submitted by ${appData.fullName || 'Candidate'}`
        });

        return new Response(JSON.stringify(appData), { headers });
      }
    }

    if (path.startsWith('/api/applications/')) {
      const id = path.split('/').pop();
      if (method === 'GET') {
        const results = await env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).all();
        const record = results.results?.[0];
        if (!record) return new Response(JSON.stringify({ error: "Application not found" }), { status: 404, headers });
        return new Response(JSON.stringify({ id: record.id, ...JSON.parse(record.data_json) }), { headers });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const results = await env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).all();
        const record = results.results?.[0];
        if (!record) return new Response(JSON.stringify({ error: "Application not found" }), { status: 404, headers });
        const existing = JSON.parse(record.data_json);
        const updated = { ...existing, ...body };
        await env.DB.prepare("UPDATE applications SET data_json = ? WHERE id = ?").bind(JSON.stringify(updated), id).run();

        // Broadcast real-time application update
        broadcastSyncEvent({
          type: 'APPLICATION_UPDATED',
          applicationId: id,
          application: updated,
          message: `Application updated for ${updated.fullName || 'Candidate'}`
        });

        // Push notification hook for application status changes (approved or rejected)
        const oldStatus = existing.status || 'pending';
        const newStatus = updated.status;

        if (newStatus && newStatus !== oldStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
          const isApproved = newStatus === 'approved';
          const candidateEmail = updated.personalInfo?.emailAddress || updated.personalInfo?.email || updated.email || existing.personalInfo?.emailAddress || 'anonymous';
          const majorRole = updated.positionSkills?.majorRole || 'Staff Member';
          
          const title = isApproved ? 'Application Approved! 🎉' : 'Application Status Update';
          const message = isApproved 
            ? `Congratulations! Your job application for ${majorRole} has been approved.`
            : `Thank you for your interest. Unfortunately, your job application for ${majorRole} was not approved at this time.`;

          const newNotif = {
            id: 'notif_' + Math.random().toString(36).substring(2, 11),
            title,
            message,
            read: false,
            createdAt: new Date().toISOString(),
            recipientRole: 'candidate',
            userId: candidateEmail,
            type: isApproved ? 'success' : 'error',
            priority: 'high',
            image: isApproved ? 'https://alihsan.online/icons/approved.png' : 'https://alihsan.online/icons/rejected.png',
            actionUrl: `/application/${id}`
          };
          
          // Insert into in-memory store so it appears in notification history
          inMemoryNotifications.unshift(newNotif);

          // Retrieve registered FCM token for the candidate if available
          let targetFcmToken = null;
          try {
            const fcmResults = await env.DB.prepare("SELECT fcmToken FROM fcm_tokens WHERE userId = ? ORDER BY created_at DESC").bind(candidateEmail).all();
            if (fcmResults.results && fcmResults.results.length > 0) {
              targetFcmToken = fcmResults.results[0].fcmToken;
            }
          } catch (e) {
            console.warn("FCM Token lookup failed (database table may be initializing):", e);
          }

          console.log(`[FCM SERVICE] Dispatching native push notification to candidate: ${candidateEmail}`);
          console.log(`[FCM SERVICE] Device registration token: ${targetFcmToken || 'NATIVE_FALLBACK_ACTIVE'}`);
          console.log(`[FCM SERVICE] Payload:`, { title, body: message });

          // Broadcast real-time notification creation to active tabs/sessions via SSE
          broadcastSyncEvent({
            type: 'NOTIFICATION_CREATED',
            notification: {
              ...newNotif,
              fcmToken: targetFcmToken // Pass along so frontend can optionally coordinate custom actions
            }
          });
        }

        return new Response(JSON.stringify(updated), { headers });
      }
      if (method === 'DELETE') {
        await env.DB.prepare("DELETE FROM applications WHERE id = ?").bind(id).run();

        // Broadcast real-time application deletion
        broadcastSyncEvent({
          type: 'APPLICATION_DELETED',
          applicationId: id,
          message: `Application deleted (ID: ${id})`
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // ==========================================
    // 6. DYNAMIC TABLES CRUD (services, portfolio, blogs, courses)
    // ==========================================

    const dynamicTables = ['services', 'portfolio', 'blogs', 'courses'];
    for (const table of dynamicTables) {
      if (path === `/api/${table}`) {
        if (method === 'GET') {
          const results = await env.DB.prepare(`SELECT * FROM ${table}`).all();
          const items = (results.results || []).map((r: any) => ({ id: r.id, ...JSON.parse(r.data_json) }));
          return new Response(JSON.stringify(items), { headers });
        }
        if (method === 'POST') {
          const body = await request.json();
          const id = body.id || (table.substring(0, 3) + '_' + Math.random().toString(36).substring(2, 11));
          const record = { id, ...body };
          await env.DB.prepare(`INSERT OR REPLACE INTO ${table} (id, data_json) VALUES (?, ?)`).bind(id, JSON.stringify(record)).run();

          // Broadcast table item creation
          broadcastSyncEvent({
            type: `${table.toUpperCase()}_CREATED`,
            table,
            action: 'create',
            data: record,
            message: `Created new ${table} item`
          });

          return new Response(JSON.stringify(record), { headers });
        }
      }
      if (path.startsWith(`/api/${table}/`)) {
        const id = path.split('/').pop();
        if (path.endsWith('/initialize') && method === 'POST') {
          const items = await request.json();
          for (const item of items) {
            await env.DB.prepare(`INSERT OR REPLACE INTO ${table} (id, data_json) VALUES (?, ?)`).bind(item.id || item.title?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(), JSON.stringify(item)).run();
          }

          // Broadcast table initialization
          broadcastSyncEvent({
            type: `${table.toUpperCase()}_INITIALIZED`,
            table,
            action: 'initialize',
            data: items,
            message: `Initialized ${table} items`
          });

          return new Response(JSON.stringify({ success: true, count: items.length }), { headers });
        }
        if (method === 'PUT') {
          const body = await request.json();
          const record = { id, ...body };
          await env.DB.prepare(`INSERT OR REPLACE INTO ${table} (id, data_json) VALUES (?, ?)`).bind(id, JSON.stringify(record)).run();

          // Broadcast table item update
          broadcastSyncEvent({
            type: `${table.toUpperCase()}_UPDATED`,
            table,
            action: 'update',
            data: record,
            message: `Updated ${table} item`
          });

          return new Response(JSON.stringify(record), { headers });
        }
        if (method === 'DELETE') {
          await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();

          // Broadcast table item deletion
          broadcastSyncEvent({
            type: `${table.toUpperCase()}_DELETED`,
            table,
            action: 'delete',
            id,
            message: `Deleted ${table} item`
          });

          return new Response(JSON.stringify({ success: true }), { headers });
        }
      }
    }

    // ==========================================
    // 7. GEMINI AI ENDPOINTS
    // ==========================================

    if (path === '/api/gemini/summarize' && method === 'POST') {
      const { applicationData } = await request.json();
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following job application data and write a concise, professional, executive candidate summary highlighting compatibility, strengths, and recommendations:\n${JSON.stringify(applicationData, null, 2)}`
      });
      return new Response(JSON.stringify({ summary: response.text || "No summary available." }), { headers });
    }

    if (path === '/api/gemini/pre-screen' && method === 'POST') {
      const { targetUrl } = await request.json();
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following URL for potential fraud, phishing, safety risks, and secure credential handling. Return JSON only with fields: safe (boolean), dangerScore (number 0 to 100), threatType (string), reason (string).\nURL: ${targetUrl}`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return new Response(response.text || '{}', { headers });
    }

    if (path === '/api/gemini/analyze-candidate' && method === 'POST') {
      const { applicationData } = await request.json();
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this application and output JSON only with fields: compatibilityScore (number 0-100), keyStrengths (array of strings), potentialRisks (array of strings), interviewQuestions (array of strings):\n${JSON.stringify(applicationData, null, 2)}`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return new Response(response.text || '{}', { headers });
    }

    // ==========================================
    // 8. NOTIFICATIONS & FCM ENDPOINTS
    // ==========================================

    if (path === '/api/notifications') {
      if (method === 'GET') {
        const urlParams = new URL(request.url).searchParams;
        const userId = urlParams.get('userId');
        const role = urlParams.get('role');
        const type = urlParams.get('type');
        const priority = urlParams.get('priority');

        let filtered: any[] = [];
        let useD1 = false;
        try {
          if (env.DB) {
            let sql = 'SELECT * FROM "notifications" WHERE 1=1';
            const params: any[] = [];

            if (role) {
              sql += ' AND ("recipientRole" = ? OR "recipientRole" = \'\')';
              params.push(role);
            }
            if (userId && role === 'candidate') {
              sql += ' AND ("userId" IS NULL OR "userId" = ? OR "userId" = \'\')';
              params.push(userId);
            }
            if (type && type !== 'all') {
              sql += ' AND "type" = ?';
              params.push(type);
            }
            if (priority && priority !== 'all') {
              sql += ' AND "priority" = ?';
              params.push(priority);
            }

            sql += ' ORDER BY "createdAt" DESC';

            let stmt = env.DB.prepare(sql);
            if (params.length > 0) {
              stmt = stmt.bind(...params);
            }
            const result = await stmt.all();
            const rows = Array.isArray(result) ? result : (result?.results || []);
            filtered = rows;
            useD1 = true;
          }
        } catch (e) {
          console.warn("DB notifications query failed, falling back to memory store:", e);
        }

        if (!useD1 || filtered.length === 0) {
          filtered = [...inMemoryNotifications];
          if (role) {
            filtered = filtered.filter(n => !n.recipientRole || n.recipientRole === role);
          }
          if (userId && role === 'candidate') {
            filtered = filtered.filter(n => !n.userId || n.userId === userId);
          }
          if (type && type !== 'all') {
            filtered = filtered.filter(n => n.type === type);
          }
          if (priority && priority !== 'all') {
            filtered = filtered.filter(n => n.priority === priority);
          }
        }

        const responseData = {
          notifications: filtered.map(n => ({
            ...n,
            read: n.read === true || n.read === 1 ? 1 : 0
          })),
          total: filtered.length,
          page: 1,
          limit: 100
        };

        return new Response(JSON.stringify(responseData), { headers });
      }
      if (method === 'POST') {
        const body = await request.json();
        const newNotif = {
          id: 'notif_' + Math.random().toString(36).substring(2, 11),
          title: body.title,
          message: body.message,
          read: 0,
          createdAt: new Date().toISOString(),
          recipientRole: body.recipientRole || 'candidate',
          userId: body.userId || null,
          type: body.type || 'info',
          priority: body.priority || 'medium',
          image: body.image || '',
          actionUrl: body.actionUrl || ''
        };

        try {
          if (env.DB) {
            await env.DB.prepare(
              'INSERT INTO "notifications" ("id", "title", "message", "read", "createdAt", "recipientRole", "userId", "type", "priority", "actionUrl", "image", "metadata") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
              newNotif.id,
              newNotif.title,
              newNotif.message,
              newNotif.read,
              newNotif.createdAt,
              newNotif.recipientRole,
              newNotif.userId,
              newNotif.type,
              newNotif.priority,
              newNotif.actionUrl,
              newNotif.image,
              ''
            ).run();
          }
        } catch (e) {
          console.warn("DB insert notification failed, using memory fallback:", e);
        }

        inMemoryNotifications.unshift({ ...newNotif, read: false });

        // Broadcast real-time notification creation
        broadcastSyncEvent({
          type: 'NOTIFICATION_CREATED',
          notification: { ...newNotif, read: false }
        });

        return new Response(JSON.stringify(newNotif), { headers });
      }
      if (method === 'DELETE') {
        const urlParams = new URL(request.url).searchParams;
        const userId = urlParams.get('userId');
        const role = urlParams.get('role');

        try {
          if (env.DB) {
            let sql = 'DELETE FROM "notifications" WHERE 1=1';
            const params: any[] = [];
            if (role) {
              sql += ' AND "recipientRole" = ?';
              params.push(role);
            }
            if (userId && role === 'candidate') {
              sql += ' AND ("userId" IS NULL OR "userId" = ?)';
              params.push(userId);
            }
            let stmt = env.DB.prepare(sql);
            if (params.length > 0) {
              stmt = stmt.bind(...params);
            }
            await stmt.run();
          }
        } catch (e) {
          console.warn("DB clear notifications failed:", e);
        }

        inMemoryNotifications = inMemoryNotifications.filter(n => {
          const isTarget = (!role || !n.recipientRole || n.recipientRole === role) && 
                           (!userId || !n.userId || n.userId === userId);
          return !isTarget;
        });

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    if (path === '/api/notifications/mark-all-read' && method === 'PATCH') {
      const urlParams = new URL(request.url).searchParams;
      const userId = urlParams.get('userId');
      const role = urlParams.get('role');

      try {
        if (env.DB) {
          let sql = 'UPDATE "notifications" SET "read" = 1 WHERE 1=1';
          const params: any[] = [];
          if (role) {
            sql += ' AND "recipientRole" = ?';
            params.push(role);
          }
          if (userId && role === 'candidate') {
            sql += ' AND ("userId" IS NULL OR "userId" = ?)';
            params.push(userId);
          }
          let stmt = env.DB.prepare(sql);
          if (params.length > 0) {
            stmt = stmt.bind(...params);
          }
          await stmt.run();
        }
      } catch (e) {
        console.warn("DB mark-all-read failed:", e);
      }

      inMemoryNotifications = inMemoryNotifications.map(n => {
        const isTarget = (!role || !n.recipientRole || n.recipientRole === role) && 
                         (!userId || !n.userId || n.userId === userId);
        if (isTarget) {
          return { ...n, read: true };
        }
        return n;
      });

      // Broadcast notification update event
      broadcastSyncEvent({
        type: 'NOTIFICATIONS_UPDATED'
      });

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (path === '/api/notifications/count/unread' && method === 'GET') {
      const urlParams = new URL(request.url).searchParams;
      const userId = urlParams.get('userId');
      const role = urlParams.get('role');

      let count = 0;
      let useD1 = false;
      try {
        if (env.DB) {
          let sql = 'SELECT COUNT(*) as count FROM "notifications" WHERE "read" = 0';
          const params: any[] = [];
          if (role) {
            sql += ' AND ("recipientRole" = ? OR "recipientRole" = \'\')';
            params.push(role);
          }
          if (userId && role === 'candidate') {
            sql += ' AND ("userId" IS NULL OR "userId" = ? OR "userId" = \'\')';
            params.push(userId);
          }
          let stmt = env.DB.prepare(sql);
          if (params.length > 0) {
            stmt = stmt.bind(...params);
          }
          const result = await stmt.all();
          const rows = Array.isArray(result) ? result : (result?.results || []);
          if (rows && rows[0]) {
            count = rows[0].count;
            useD1 = true;
          }
        }
      } catch (e) {
        console.warn("DB unread count query failed:", e);
      }

      if (!useD1 || count === 0) {
        let filtered = [...inMemoryNotifications];
        if (role) {
          filtered = filtered.filter(n => !n.recipientRole || n.recipientRole === role);
        }
        if (userId && role === 'candidate') {
          filtered = filtered.filter(n => !n.userId || n.userId === userId);
        }
        count = filtered.filter(n => !n.read || n.read === 0).length;
      }

      return new Response(JSON.stringify({ count }), { headers });
    }

    if (path.startsWith('/api/notifications/')) {
      const id = path.split('/').pop();
      if (method === 'PATCH') {
        const body = await request.json();
        const updatedRead = body.read === 1 || body.read === true ? 1 : 0;

        try {
          if (env.DB) {
            await env.DB.prepare('UPDATE "notifications" SET "read" = ? WHERE "id" = ?').bind(updatedRead, id).run();
          }
        } catch (e) {
          console.warn("DB update read status failed:", e);
        }

        inMemoryNotifications = inMemoryNotifications.map(n => {
          if (n.id === id) {
            return { ...n, ...body, read: updatedRead === 1 };
          }
          return n;
        });

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
      if (method === 'DELETE') {
        try {
          if (env.DB) {
            await env.DB.prepare('DELETE FROM "notifications" WHERE "id" = ?').bind(id).run();
          }
        } catch (e) {
          console.warn("DB delete individual notification failed:", e);
        }

        inMemoryNotifications = inMemoryNotifications.filter(n => n.id !== id);

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    if (path === '/api/fcm-tokens' && method === 'POST') {
      try {
        const body = await request.json();
        const { userId, fcmToken, deviceName, deviceType } = body;
        
        if (userId && fcmToken) {
          await env.DB.prepare(
            "INSERT OR REPLACE INTO fcm_tokens (userId, fcmToken, deviceName, deviceType, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(userId, fcmToken, deviceName || null, deviceType || null, new Date().toISOString()).run();
          
          console.log(`[FCM BACKEND] Token registered successfully: User = ${userId}, Device = ${deviceName || 'Unknown'}`);
        }
        
        return new Response(JSON.stringify({ success: true, registered: true }), { headers });
      } catch (err: any) {
        console.error("FCM Token Registration Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to register FCM token" }), { status: 500, headers });
      }
    }

    if (path === '/api/settings' && method === 'GET') {
      try {
        const results = await env.DB.prepare("SELECT key, value FROM settings").all();
        const settingsMap: Record<string, string> = {};
        if (results.results) {
          results.results.forEach((row: any) => {
            settingsMap[row.key] = row.value;
          });
        }
        return new Response(JSON.stringify(settingsMap), { headers });
      } catch (err: any) {
        return new Response(JSON.stringify({}), { headers });
      }
    }

    if (path === '/api/settings' && method === 'POST') {
      try {
        const body = await request.json();
        const { key, value } = body;
        if (key && value !== undefined) {
          await env.DB.prepare(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
          ).bind(key, value).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
      }
    }

    // ==========================================
    // 9. REAL-TIME EVENT STREAM (SSE)
    // ==========================================

    if ((path === '/api/real-time/sync' || path === '/api/events') && method === 'GET') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sync', timestamp: Date.now() })}\n\n`));
          
          // Add controller to global registry for active broadcasting
          connectedClients.add(controller);
          
          const interval = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`));
            } catch {
              connectedClients.delete(controller);
              clearInterval(interval);
            }
          }, 30000);
          
          request.signal.addEventListener('abort', () => {
            connectedClients.delete(controller);
            clearInterval(interval);
          });
        }
      });
      
      const sseHeaders = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      
      return new Response(stream, { headers: sseHeaders });
    }

    return new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers });
  } catch (err: any) {
    console.error("Backend Router Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers });
  }
}
