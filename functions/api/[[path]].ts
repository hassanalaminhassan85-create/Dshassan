import { GoogleGenAI } from "@google/genai";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} from '@simplewebauthn/server';

// Temporary memory store for stateless fallback
let inMemoryNotifications: any[] = [
  { id: 'notif-1', title: 'System Calibrated', message: 'Biometric cryptographic keys locked & synchronized on secure enclave.', read: false, createdAt: new Date().toISOString() },
  { id: 'notif-2', title: 'Welcome to DS Tech', message: 'Your candidate portal is now active. Complete your professional roadmap.', read: true, createdAt: new Date().toISOString() }
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

export async function onRequest(context: { request: Request; env: any; params: any }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-ID, Authorization',
  });

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const rpId = url.hostname;
  const origin = `${url.protocol}//${url.host}`;

  try {
    // ==========================================
    // 1. WEBAUTHN SIGNUP / REGISTRATION FLOW
    // ==========================================

    if (path === '/api/auth/register-options' && method === 'GET') {
      const userId = url.searchParams.get('userId') || 'usr-demo';
      const username = url.searchParams.get('username') || 'candidate2026@dstech.com';

      const options = await generateRegistrationOptions({
        rpName: 'DS Tech Candidate Hub',
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

      // Save options/challenge state securely in HttpOnly cookie
      headers.append('Set-Cookie', `reg_options=${btoa(JSON.stringify({ challenge: options.challenge, userId, username }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`);

      return new Response(JSON.stringify(options), { headers });
    }

    if (path === '/api/auth/verify-registration' && method === 'POST') {
      const body = await request.json();
      const cookieHeader = request.headers.get('Cookie') || '';
      
      // Simulation bypass
      if (body.isSimulation) {
        const userId = body.userId || 'usr-demo';
        const email = body.email || 'candidate2026@dstech.com';
        const credIdBase64 = btoa('mock-cred-id-' + Math.random().toString());
        const pubKeyBase64 = btoa('mock-pub-key');

        await env.DB.prepare(
          "INSERT OR REPLACE INTO users (id, email, full_name, role, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(userId, email, email.split('@')[0], 'Applicant', new Date().toISOString()).run();

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

        // Broadcast simulated registration success
        broadcastSyncEvent({
          type: 'BIOMETRIC_REGISTRATION',
          userId,
          email,
          message: `Simulated biometric key bound for ${email}`
        });

        return new Response(JSON.stringify({ verified: true, isSimulation: true }), { headers });
      }

      const match = cookieHeader.match(/reg_options=([^;]+)/);
      if (!match) {
        return new Response(JSON.stringify({ verified: false, error: "Registration session expired or challenge not found." }), { status: 400, headers });
      }

      const sessionData = JSON.parse(atob(match[1]));

      const verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge: sessionData.challenge,
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

        // Fallback to base64 representation safely depending on whether it is a string or Uint8Array
        const credIdBase64 = typeof credentialID === 'string' 
          ? credentialID 
          : btoa(String.fromCharCode(...(credentialID instanceof Uint8Array ? credentialID : [])));
        
        const pubKeyBase64 = typeof credentialPublicKey === 'string' 
          ? credentialPublicKey 
          : btoa(String.fromCharCode(...(credentialPublicKey instanceof Uint8Array ? credentialPublicKey : [])));

        // Persist User in D1 database
        await env.DB.prepare(
          "INSERT OR REPLACE INTO users (id, email, full_name, role, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(
          sessionData.userId,
          sessionData.username,
          sessionData.username.split('@')[0],
          'Applicant',
          new Date().toISOString()
        ).run();

        // Persist WebAuthn Credential in D1 database
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

        // Log security audit log
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

        // Broadcast real-time registration success
        broadcastSyncEvent({
          type: 'BIOMETRIC_REGISTRATION',
          userId: sessionData.userId,
          email: sessionData.username,
          message: `New biometric hardware key bound via WebAuthn for ${sessionData.username}`
        });

        // Clear the registration options cookie
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

      // If we have a userId, retrieve their passkeys
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

      headers.append('Set-Cookie', `auth_options=${btoa(JSON.stringify({ challenge: options.challenge, userId, username }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`);

      return new Response(JSON.stringify(options), { headers });
    }

    if (path === '/api/auth/authenticate-verify' && method === 'POST') {
      const body = await request.json();
      const cookieHeader = request.headers.get('Cookie') || '';

      // Simulation bypass
      if (body.isSimulation) {
        const userId = body.userId || 'usr-demo';
        const email = body.email || 'candidate2026@dstech.com';

        // Check if user exists, otherwise create one
        const userResults = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).all();
        let user = userResults.results?.[0];
        if (!user) {
          await env.DB.prepare(
            "INSERT OR REPLACE INTO users (id, email, full_name, role, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(userId, email, email.split('@')[0], 'Applicant', new Date().toISOString()).run();
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

        // Broadcast simulated login success
        broadcastSyncEvent({
          type: 'BIOMETRIC_LOGIN',
          userId,
          email: userSession.email,
          message: `Candidate ${userSession.fullName} logged in successfully (Simulated)`
        });

        return new Response(JSON.stringify({ verified: true, user: userSession, isSimulation: true }), { headers });
      }

      const match = cookieHeader.match(/auth_options=([^;]+)/);
      if (!match) {
        return new Response(JSON.stringify({ verified: false, error: "Authentication session expired." }), { status: 400, headers });
      }

      const sessionData = JSON.parse(atob(match[1]));

      // Fetch credential from D1
      const credIdBase64 = body.response.id;
      const results = await env.DB.prepare("SELECT * FROM passkeys WHERE id = ?").bind(credIdBase64).all();
      const passkey = results.results?.[0];

      if (!passkey) {
        return new Response(JSON.stringify({ verified: false, error: "Hardware credential unregistered on this D1 ledger." }), { status: 400, headers });
      }

      // Convert stored base64 public key back to Uint8Array
      const pubKeyBinary = atob(passkey.public_key);
      const pubKeyBytes = new Uint8Array(pubKeyBinary.length);
      for (let i = 0; i < pubKeyBinary.length; i++) {
        pubKeyBytes[i] = pubKeyBinary.charCodeAt(i);
      }

      const verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge: sessionData.challenge,
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
        // Update counter in database to prevent replay attacks
        await env.DB.prepare("UPDATE passkeys SET counter = ? WHERE id = ?").bind(verification.authenticationInfo.newCounter, passkey.id).run();

        // Get user profile
        const userResults = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(passkey.user_id).all();
        const user = userResults.results?.[0];

        // Generate Secure HttpOnly session cookie
        const userSession = {
          userId: passkey.user_id,
          email: user?.email || sessionData.username || 'candidate@dstech.com',
          fullName: user?.full_name || 'Candidate',
          role: user?.role || 'Applicant'
        };
        headers.append('Set-Cookie', `dstech_session=${btoa(JSON.stringify(userSession))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

        // Log security audit log
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

        // Broadcast real biometric login success
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
    // 3. SECURITY LOGS & ATTEMPTS AUDITING
    // ==========================================

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
        return new Response(JSON.stringify(inMemoryNotifications), { headers });
      }
      if (method === 'POST') {
        const body = await request.json();
        const newNotif = {
          id: 'notif_' + Math.random().toString(36).substring(2, 11),
          title: body.title,
          message: body.message,
          read: false,
          createdAt: new Date().toISOString(),
          recipientRole: body.recipientRole || 'admin',
          userId: body.userId || null,
          type: body.type || 'info',
          priority: body.priority || 'medium',
          image: body.image || null,
          actionUrl: body.actionUrl || null
        };
        inMemoryNotifications.unshift(newNotif);

        // Broadcast real-time notification creation
        broadcastSyncEvent({
          type: 'NOTIFICATION_CREATED',
          notification: newNotif
        });

        return new Response(JSON.stringify(newNotif), { headers });
      }
      if (method === 'DELETE') {
        inMemoryNotifications = [];

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    if (path === '/api/notifications/mark-all-read' && method === 'PATCH') {
      inMemoryNotifications = inMemoryNotifications.map(n => ({ ...n, read: true }));

      // Broadcast notification update event
      broadcastSyncEvent({
        type: 'NOTIFICATIONS_UPDATED'
      });

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (path === '/api/notifications/count/unread' && method === 'GET') {
      const count = inMemoryNotifications.filter(n => !n.read).length;
      return new Response(JSON.stringify({ count }), { headers });
    }

    if (path.startsWith('/api/notifications/')) {
      const id = path.split('/').pop();
      if (method === 'PATCH') {
        const body = await request.json();
        inMemoryNotifications = inMemoryNotifications.map(n => n.id === id ? { ...n, ...body } : n);

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
      if (method === 'DELETE') {
        inMemoryNotifications = inMemoryNotifications.filter(n => n.id !== id);

        // Broadcast notification update event
        broadcastSyncEvent({
          type: 'NOTIFICATIONS_UPDATED'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    if (path === '/api/fcm-tokens' && method === 'POST') {
      return new Response(JSON.stringify({ success: true, registered: true }), { headers });
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
