import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory conversation store for threads
  const conversationsStore = new Map<string, { id: string; title: string; user_role: string; updated_at: string; messages: Array<any> }>();
  // In-memory course registrations store
  const courseRegistrationsStore = new Map<string, any>();

  // Live DS Tech Backend Knowledge Base Helper
  function getLiveDsTechContext(message: string, userRole?: string, userData?: any, pageContext?: any): string {
    const lower = message.toLowerCase();
    
    let context = `\n--- [AUTHORIZED LIVE DS TECH BACKEND RETRIEVAL DATA] ---\n`;
    context += `• COMPANY REGISTRATION & CORPORATE IDENTIFICATION:\n`;
    context += `  - Full Legal Name: DS Tech & Digital Marketing Agency Limited\n`;
    context += `  - Registration Number: CAC RC-1849204 (Corporate Affairs Commission, Federal Republic of Nigeria)\n`;
    context += `  - Tax Identification Number (TIN): 24892019-0001\n`;
    context += `  - Company Status: Active, Fully Certified & Compliant\n`;
    context += `  - Headquarters Address: Garki, Abuja, Federal Capital Territory, Nigeria (GPS: 9.0272° N, 7.4913° E)\n`;
    context += `  - Contact Hotline: +234 813 123 4567 | Support Email: info@dstechagency.com / support@dstechagency.com\n`;
    context += `  - Official Website: https://www.dstechagency.com/\n`;
    context += `  - Core Corporate Services: Enterprise Software Development, AI Solutions & Agent Integrations, Cloud Infrastructure & DevOps, Cybersecurity Auditing, Digital Performance Marketing, Brand Growth Engineering, and Professional IT Training via DS Tech Academy.\n\n`;

    context += `• OFFICIAL ACADEMY PRICING MATRIX:\n`;
    context += `  - 1 Month Duration: Virtual = ₦50,000 | Physical = ₦100,000 | Hybrid = ₦150,000\n`;
    context += `  - 3 Months Duration: Virtual = ₦100,000 | Physical = ₦200,000 | Hybrid = ₦300,000\n`;
    context += `  - 6 Months Duration: Virtual = ₦200,000 | Physical = ₦300,000 | Hybrid = ₦400,000\n\n`;

    context += `• FEATURED ACADEMY PROGRAMMES & COURSES:\n`;
    context += `  - DSTA-AI101: Artificial Intelligence (AI) for Business & Productivity (₦45,000) - Master prompt engineering, Gemini integrations, custom AI agents, document & spreadsheet AI.\n`;
    context += `  - DSTA-AIK102: AI for Kids & Teens Productivity Programme (₦35,000) - AI literacy, creative art, junior block coding.\n`;
    context += `  - Full Stack Software Engineering (React, Node.js, TypeScript, Cloud Architecture, Databases)\n`;
    context += `  - Data Science, Machine Learning & AI Engineering\n`;
    context += `  - Cyber Security Defence & Ethical Hacking\n`;
    context += `  - Digital Performance Marketing, SEO & Growth Engineering\n`;
    context += `  - UI/UX Product Design & Design Systems\n`;
    context += `  - Cloud Engineering & DevOps (AWS/GCP/Docker/K8s)\n`;
    context += `  - Embedded Systems & IoT Engineering\n\n`;

    if (pageContext) {
      context += `• CURRENT VISITOR / PAGE CONTEXT:\n`;
      if (pageContext.pageTitle) context += `  - Active Page / Section: ${pageContext.pageTitle}\n`;
      if (pageContext.route) context += `  - Route: ${pageContext.route}\n`;
      if (pageContext.section) context += `  - Section: ${pageContext.section}\n`;
      if (pageContext.programmeOrCourse) context += `  - Currently Viewed Item: ${pageContext.programmeOrCourse}\n`;
      if (pageContext.pricing) context += `  - Pricing Detail: ${pageContext.pricing}\n`;
      if (pageContext.workflowState) context += `  - Active Workflow: ${pageContext.workflowState}\n`;
      context += `\n`;
    }

    if (userData) {
      context += `• AUTHENTICATED USER SESSION DATA:\n`;
      if (userData.fullName || userData.name) context += `  - User Name: ${userData.fullName || userData.name}\n`;
      if (userData.email) context += `  - User Email: ${userData.email}\n`;
      if (userRole) context += `  - Assigned Role: ${userRole}\n`;
      if (userData.enrollmentStatus) context += `  - Academy Enrollment: ${userData.enrollmentStatus}\n`;
      if (userData.enrolledCourses) context += `  - Enrolled Courses: ${JSON.stringify(userData.enrolledCourses)}\n`;
      if (userData.applicationStatus) context += `  - Job Candidate Status: ${userData.applicationStatus}\n`;
      context += `\n`;
    } else if (userRole) {
      context += `• ACTIVE SESSION ROLE: ${userRole}\n\n`;
    }

    context += `--- [END RETRIEVAL DATA] ---\n`;
    return context;
  }

  function buildSystemPrompt(userRole?: string, liveContext?: string, pageContext?: any): string {
    const role = userRole || 'Public';
    const route = pageContext?.route || 'home';

    let personaInstruction = '';

    if (role === 'Student' || route === 'student-dashboard') {
      personaInstruction = `
ROLE PERSONA: DEDICATED STUDENT TUTOR & ACADEMIC INSTRUCTOR
- You are acting as the student's personal 1-on-1 Academic Tutor and Tech Instructor at DS Tech Academy.
- Your primary goal is to guide the student patiently through their enrolled courses (Software Engineering, AI, Data Science, Cyber Security, etc.).
- Help them break down complex technical topics, write and debug code snippets step-by-step, explain errors, provide practice exercises, and encourage their learning journey.
- Keep your tone supportive, structured, educational, and engaging.
`;
    } else if (role === 'Tutor' || route === 'tutor-dashboard') {
      personaInstruction = `
ROLE PERSONA: ACADEMIC ASSISTANT & FACULTY CO-PILOT
- You are acting as an Academic Co-pilot and Teaching Assistant for DS Tech Academy tutors and instructors.
- Help tutors design curriculum outlines, generate student quiz questions, format lesson plans, review student submission criteria, and structure teaching methodologies.
- Provide clear, professional, and efficient pedagogical assistance.
`;
    } else if (role === 'Admin' || route === 'admin') {
      personaInstruction = `
ROLE PERSONA: ENTERPRISE PLATFORM & OPERATIONS CO-PILOT
- You are acting as an Operations & Systems Co-pilot for DS Tech Platform Administrators.
- Assist administrators with platform diagnostics, candidate recruitment summaries, CAC compliance audit verifications, system usage analytics, and staff management workflows.
- Keep responses concise, analytical, authoritative, and actionable.
`;
    } else if (role === 'Applicant') {
      personaInstruction = `
ROLE PERSONA: CAREER & RECRUITMENT SPECIALIST
- You are acting as a Career & Recruitment Specialist for candidates applying for jobs at DS Tech.
- Assist applicants with application status inquiries, technical interview preparation tips, resume optimization recommendations, and career path guidance.
- Maintain an encouraging, professional, and structured tone.
`;
    } else if (role === 'Client') {
      personaInstruction = `
ROLE PERSONA: SENIOR SOLUTIONS ARCHITECT & ACCOUNT SPECIALIST
- You are acting as a Senior Solutions Architect and Client Account Specialist for DS Tech clients.
- Help clients track software project deliverables, request digital marketing or engineering proposals, understand milestones, and explore enterprise technology solutions.
- Keep responses polished, professional, strategic, and client-centric.
`;
    } else if (route === 'academy-overview' || route === 'training') {
      personaInstruction = `
ROLE PERSONA: ACADEMY ADMISSIONS ADVISOR & COURSE SPECIALIST
- You are acting as an Academic Admissions Advisor for prospective DS Tech Academy students.
- Explain all 1, 3, and 6-month programmes, Virtual vs Physical vs Hybrid pricing options, course outlines, practical projects, certifications, and step-by-step enrollment guidance.
- Present pricing clearly (1 Mo: ₦50k/100k/150k; 3 Mo: ₦100k/200k/300k; 6 Mo: ₦200k/300k/400k) and answer prospective student questions warmly and thoroughly.
`;
    } else {
      personaInstruction = `
ROLE PERSONA: DS TECH CORPORATE REPRESENTATIVE & COMPANY INFORMATION SPECIALIST
- You are acting as the official Corporate Representative and Information Specialist for DS Tech & Digital Marketing Agency Limited.
- Whenever a visitor asks any question in any prompt style (e.g. "tell me about this company", "who are you", "what do you do", "cac registration", "pricing", "contact info", "where are you located", "services"), provide comprehensive, warm, and accurate company details.
- Always include CAC Registration (RC-1849204), Garki Abuja headquarters location, phone contact (+234 813 123 4567), email (info@dstechagency.com), official website (https://www.dstechagency.com/), core digital agency services, and Academy training offerings.
- You understand any prompt style and seamlessly answer general knowledge or company-specific questions.
`;
    }

    return `You are DS TECH AI, an intelligent, versatile, and articulate AI created by DS Tech & Digital Marketing Agency Limited (RC-1849204).

${personaInstruction}

CORE RULES:
1. GENERAL INTELLIGENCE:
   - You are a full general-purpose assistant. You excel at coding, mathematical reasoning, writing, strategy, language translation, data analysis, science, and everyday questions.
   - Answer general questions using your full reasoning and knowledge.
   - Never say that an answer is unavailable or that you are restricted to a database.

2. CONTEXT-AWARE AMBIGUITY RESOLUTION:
   ${pageContext ? `The user is currently viewing: "${pageContext.programmeOrCourse || pageContext.pageTitle || 'DS TECH Platform'}".
   - When the user asks relative questions like "How long is this?", "Is there a hybrid option?", "How much does it cost?", or "What will I learn?", they are referring to the currently viewed item (${pageContext.programmeOrCourse || pageContext.pageTitle}).
   - Provide direct, accurate answers using the page context and authoritative DS TECH data.` : ''}

3. DS TECH DATA ACCURACY:
   - Always reference accurate company details: CAC Registration RC-1849204, Garki Abuja headquarters, phone +234 813 123 4567, TIN 24892019-0001.
   - For Academy pricing: 1 Month (Virtual ₦50k, Physical ₦100k, Hybrid ₦150k), 3 Months (Virtual ₦100k, Physical ₦200k, Hybrid ₦300k), 6 Months (Virtual ₦200k, Physical ₦300k, Hybrid ₦400k).

4. RESPONSE STYLE & FORMATTING:
   - Simple question → direct, clear, concise answer.
   - Technical / Coding → brief explanation + clean Markdown code block + concise breakdown.
   - Educational / Tutoring → step-by-step guidance + clear examples.
   - Do NOT force rigid canned headers on every single message.

${liveContext ? liveContext : ''}`;
  }

  // Streaming AI Chat Endpoint (Server-Sent Events)
  app.post('/api/ai/chat/stream', async (req, res) => {
    try {
      const { message, conversationId, roleOverride, userData, history, pageContext } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const activeConvId = conversationId || 'conv_' + Date.now();
      let conv = conversationsStore.get(activeConvId);
      if (!conv) {
        conv = {
          id: activeConvId,
          title: message.length > 35 ? message.substring(0, 35) + '...' : message,
          user_role: roleOverride || 'Public',
          updated_at: new Date().toISOString(),
          messages: []
        };
        conversationsStore.set(activeConvId, conv);
      }

      conv.messages.push({
        sender: 'user',
        content: message,
        created_at: new Date().toISOString()
      });

      const liveContext = getLiveDsTechContext(message, roleOverride, userData, pageContext);
      const systemInstruction = buildSystemPrompt(roleOverride, liveContext, pageContext);

      const apiKey = process.env.GEMINI_API_KEY;
      let fullReply = '';

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          // Build multi-turn content if history exists
          const contentsPayload: any[] = [];

          if (Array.isArray(history) && history.length > 0) {
            history.slice(-10).forEach((msg: any) => {
              contentsPayload.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
              });
            });
          }

          contentsPayload.push({
            role: 'user',
            parts: [{ text: message }]
          });

          const streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3.7-flash',
            contents: contentsPayload,
            config: {
              systemInstruction: systemInstruction
            }
          });

          for await (const chunk of streamResponse) {
            const chunkText = chunk.text;
            if (chunkText) {
              fullReply += chunkText;
              res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            }
          }
        } catch (streamErr: any) {
          console.warn('Streaming failed or model unavailable, trying non-streaming fallback:', streamErr?.message || streamErr);
        }
      }

      // If streaming produced no output (or key missing), send fallback error response
      if (!fullReply) {
        res.write(`data: ${JSON.stringify({ error: 'Unable to generate a response right now.' })}\n\n`);
        return res.end();
      }

      conv.messages.push({
        sender: 'assistant',
        content: fullReply,
        created_at: new Date().toISOString()
      });
      conv.updated_at = new Date().toISOString();
      conversationsStore.set(activeConvId, conv);

      res.write(`data: ${JSON.stringify({ done: true, conversationId: activeConvId, reply: fullReply })}\n\n`);
      return res.end();
    } catch (err: any) {
      console.error('API /api/ai/chat/stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message || 'Streaming interrupted' })}\n\n`);
        res.end();
      }
    }
  });

  // Standard non-streaming AI Chat Endpoint using @google/genai (gemini-3.7-flash)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, conversationId, roleOverride, userData, history, pageContext } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const activeConvId = conversationId || 'conv_' + Date.now();
      let conv = conversationsStore.get(activeConvId);
      if (!conv) {
        conv = {
          id: activeConvId,
          title: message.length > 35 ? message.substring(0, 35) + '...' : message,
          user_role: roleOverride || 'Public',
          updated_at: new Date().toISOString(),
          messages: []
        };
        conversationsStore.set(activeConvId, conv);
      }

      conv.messages.push({
        sender: 'user',
        content: message,
        created_at: new Date().toISOString()
      });

      let reply = '';
      let sources: Array<{ id: string; title: string; category: string }> = [];

      const liveContext = getLiveDsTechContext(message, roleOverride, userData, pageContext);
      const systemInstruction = buildSystemPrompt(roleOverride, liveContext, pageContext);

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
        for (const modelName of modelsToTry) {
          try {
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build'
                }
              }
            });

            const contentsPayload: any[] = [];

            if (Array.isArray(history) && history.length > 0) {
              history.slice(-10).forEach((msg: any) => {
                contentsPayload.push({
                  role: msg.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content }]
                });
              });
            }

            contentsPayload.push({
              role: 'user',
              parts: [{ text: message }]
            });

            const response = await ai.models.generateContent({
              model: modelName,
              contents: contentsPayload,
              config: {
                systemInstruction: systemInstruction
              }
            });

            if (response && response.text) {
              reply = response.text;
              break;
            }
          } catch (geminiErr: any) {
            console.warn(`Model ${modelName} failed or unavailable:`, geminiErr?.message || geminiErr);
          }
        }
      }

      if (!reply) {
        return res.status(500).json({
          success: false,
          error: 'Unable to generate a response right now.'
        });
      }

      conv.messages.push({
        sender: 'assistant',
        content: reply,
        sources,
        created_at: new Date().toISOString()
      });
      conv.updated_at = new Date().toISOString();
      conversationsStore.set(activeConvId, conv);

      return res.json({
        success: true,
        reply,
        sources,
        conversationId: activeConvId
      });
    } catch (err: any) {
      console.error('API /api/ai/chat error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
      });
    }
  });

  app.get('/api/ai/conversations', (req, res) => {
    try {
      const list = Array.from(conversationsStore.values()).map(c => ({
        id: c.id,
        title: c.title,
        user_role: c.user_role,
        updated_at: c.updated_at
      })).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      return res.json(list);
    } catch (err) {
      return res.json([]);
    }
  });

  app.get('/api/ai/conversations/:id', (req, res) => {
    const conv = conversationsStore.get(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    return res.json(conv);
  });

  app.delete('/api/ai/conversations/:id', (req, res) => {
    conversationsStore.delete(req.params.id);
    return res.json({ success: true });
  });

  app.put('/api/ai/conversations/:id', (req, res) => {
    const conv = conversationsStore.get(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    const { title } = req.body;
    if (title && typeof title === 'string') {
      conv.title = title.trim();
      conv.updated_at = new Date().toISOString();
      conversationsStore.set(req.params.id, conv);
    }
    return res.json({ success: true, conversation: conv });
  });

  // Course Registration Endpoints
  app.post('/api/academy/course-registrations', (req, res) => {
    try {
      const body = req.body;
      if (!body || !body.fullName || !body.emailAddress || !body.whatsappNumber) {
        return res.status(400).json({ success: false, error: 'Missing required applicant fields.' });
      }

      const id = body.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const registrationId = body.registrationId || `DSTA-CR/2026/${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();

      // Normalize array-based fields for resilient database storage
      const programmeTypes = Array.isArray(body.programmeTypes) && body.programmeTypes.length > 0
        ? body.programmeTypes
        : (body.programmeType ? [body.programmeType] : ['Scholarship']);

      const teachingLanguages = Array.isArray(body.teachingLanguages) && body.teachingLanguages.length > 0
        ? body.teachingLanguages
        : (body.teachingLanguage ? [body.teachingLanguage] : ['English']);

      const record = {
        ...body,
        id,
        registrationId,
        programmeTypes,
        programmeType: programmeTypes.length === 2 ? 'Scholarship & Paid Programme' : programmeTypes.join(', '),
        teachingLanguages,
        teachingLanguage: teachingLanguages.join(', '),
        createdAt: body.createdAt || now,
        updatedAt: now,
      };

      courseRegistrationsStore.set(registrationId, record);
      return res.json({ success: true, record });
    } catch (err: any) {
      console.error('Error saving course registration in server:', err);
      return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });

  app.get('/api/academy/course-registrations', (req, res) => {
    const list = Array.from(courseRegistrationsStore.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, count: list.length, records: list });
  });

  // ==========================================
  // Certificate of Employment Endpoints
  // ==========================================
  const certificatesStore = new Map<string, any>();

  // 1. Create or save certificate
  app.post('/api/certificates', (req, res) => {
    try {
      const body = req.body;
      if (!body || !body.employeeName || !body.employeeId || !body.position || !body.department) {
        return res.status(400).json({ success: false, error: 'Missing required employee certificate fields.' });
      }

      const id = body.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();
      const currentYear = new Date().getFullYear();

      const existingCerts = Array.from(certificatesStore.values());
      const nextCount = existingCerts.length + 1;
      const certificateNumber = body.certificateNumber || `DST/COE/${currentYear}/${String(nextCount).padStart(4, '0')}`;
      const appointmentRefNo = body.appointmentRefNo || `DST/COE/${currentYear}/${String(nextCount).padStart(4, '0')}`;
      const verificationCode = body.verificationCode || `DST-VRF-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const record = {
        ...body,
        id,
        certificateNumber,
        appointmentRefNo,
        verificationCode,
        status: body.status || 'Issued',
        createdAt: body.createdAt || now,
        updatedAt: now,
      };

      certificatesStore.set(id, record);
      return res.json({ success: true, certificate: record });
    } catch (err: any) {
      console.error('Error saving certificate in server:', err);
      return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });

  // 2. List all certificates
  app.get('/api/certificates', (req, res) => {
    try {
      const list = Array.from(certificatesStore.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({ success: true, count: list.length, certificates: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to retrieve certificates' });
    }
  });

  // 3. Get certificate by ID
  app.get('/api/certificates/:id', (req, res) => {
    const cert = certificatesStore.get(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }
    return res.json({ success: true, certificate: cert });
  });

  // 4. Public verification endpoint by verificationCode, certificateNumber, or ID (supports slashes e.g. DST/COE/2026/0001)
  app.get(['/api/certificates/verify/:code', '/api/certificates/verify/*splat'], (req, res) => {
    try {
      const rawParam = req.params.code || (req.params as any)[0] || req.url.replace(/^\/api\/certificates\/verify\/?/, '');
      const searchCode = decodeURIComponent(rawParam).trim().toLowerCase();
      const all = Array.from(certificatesStore.values());
      const match = all.find(c => 
        (c.verificationCode && c.verificationCode.toLowerCase() === searchCode) ||
        (c.certificateNumber && c.certificateNumber.toLowerCase() === searchCode) ||
        (c.id && c.id.toLowerCase() === searchCode)
      );

      if (!match) {
        return res.status(404).json({ 
          success: false, 
          verified: false, 
          error: 'Certificate not found. The provided verification code is invalid or does not match any official DS Tech record.' 
        });
      }

      // Return public verification fields only
      const publicCert = {
        id: match.id,
        certificateNumber: match.certificateNumber,
        appointmentRefNo: match.appointmentRefNo,
        employeeName: match.employeeName,
        employeeId: match.employeeId,
        position: match.position,
        department: match.department,
        dateOfAppointment: match.dateOfAppointment,
        dateOfConfirmation: match.dateOfConfirmation,
        employmentStatus: match.employmentStatus,
        employmentType: match.employmentType,
        issueDate: match.issueDate,
        authorizedOfficerName: match.authorizedOfficerName,
        authorizedOfficerPosition: match.authorizedOfficerPosition,
        signatureDataUrl: match.signatureDataUrl,
        signatureType: match.signatureType,
        ceoSignatoryName: match.ceoSignatoryName,
        ceoSignatureDate: match.ceoSignatureDate,
        ceoSignatureTitle: match.ceoSignatureTitle,
        ceoSignatureHash: match.ceoSignatureHash,
        status: match.status,
        verificationCode: match.verificationCode,
        qrVerificationUrl: match.qrVerificationUrl,
        createdAt: match.createdAt,
        verifiedAt: new Date().toISOString()
      };

      return res.json({ success: true, verified: true, certificate: publicCert });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Verification service error' });
    }
  });

  // 5. Update certificate status (Revoke, Reissue, etc.)
  app.patch('/api/certificates/:id/status', (req, res) => {
    try {
      const cert = certificatesStore.get(req.params.id);
      if (!cert) {
        return res.status(404).json({ success: false, error: 'Certificate not found' });
      }

      const { status, revocationReason, reissueNote, previousCertificateId, updatedBy } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const now = new Date().toISOString();
      const updated = {
        ...cert,
        status,
        revocationReason: revocationReason !== undefined ? revocationReason : cert.revocationReason,
        reissueNote: reissueNote !== undefined ? reissueNote : cert.reissueNote,
        previousCertificateId: previousCertificateId || cert.previousCertificateId,
        updatedBy: updatedBy || cert.updatedBy,
        updatedAt: now
      };

      certificatesStore.set(req.params.id, updated);
      return res.json({ success: true, certificate: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Update status error' });
    }
  });

  // 6. Delete certificate permanently
  app.delete('/api/certificates/:id', (req, res) => {
    try {
      const id = req.params.id;
      if (!certificatesStore.has(id)) {
        return res.status(404).json({ success: false, error: 'Certificate not found' });
      }
      certificatesStore.delete(id);
      return res.json({ success: true, message: `Certificate ${id} deleted successfully` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Delete certificate error' });
    }
  });

  // ==========================================
  // Management Accounts Corporate Backend System
  // ==========================================
  const MGMT_SALT = 'dstech_mgmt_salt_2026_abj';
  function hashPassword(pass: string): string {
    return crypto.pbkdf2Sync(pass, MGMT_SALT, 100000, 64, 'sha512').toString('hex');
  }

  // Pre-hashed default password: "dstech%)"
  const INITIAL_PASSWORD_HASH = hashPassword('dstech%)');

  interface ManagementAccountRecord {
    id: string;
    role: string;
    roleTitle: string;
    department: string;
    departmentCode: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar: string;
    phone: string;
    officeLocation: string;
    bio: string;
    joinedDate: string;
    permissions: string[];
  }

  const managementAccountsStore = new Map<string, ManagementAccountRecord>([
    [
      'dstechceooffice@gmail.com',
      {
        id: 'mgmt_ceo',
        role: 'CEO',
        roleTitle: 'CEO',
        department: 'Executive Leadership & Board of Directors',
        departmentCode: 'EXEC',
        email: 'dstechceooffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Chief Executive Officer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4567',
        officeLocation: 'Executive Suite 401, DS Tech Headquarters, Garki, Abuja',
        bio: 'Chief Executive Officer directing corporate strategy, board governance, and technological innovation across DS Tech and Academy divisions.',
        joinedDate: '2021-03-15',
        permissions: ['ALL', 'EXECUTIVE_APPROVE', 'BOARD_REPORTING', 'FINANCE_OVERVIEW', 'STRATEGY_DIRECTIVE']
      }
    ],
    [
      'dstechanddigitalmarketingltd@gmail.com',
      {
        id: 'mgmt_hr',
        role: 'HOD_HR',
        roleTitle: 'HOD, Human Resource Management',
        department: 'Human Resource Management',
        departmentCode: 'HRM',
        email: 'dstechanddigitalmarketingltd@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, HR',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4568',
        officeLocation: 'HR Directorate Suite 204, Garki, Abuja',
        bio: 'Leading talent acquisition, Academy faculty accreditations, employee welfare, and regulatory workplace compliance.',
        joinedDate: '2021-06-01',
        permissions: ['HR_MANAGE', 'FACULTY_ONBOARD', 'STAFF_EVALUATE', 'PAYROLL_VERIFY']
      }
    ],
    [
      'dstechadminoffice@gmail.com',
      {
        id: 'mgmt_admin',
        role: 'HOD_ADMIN',
        roleTitle: 'HOD, Administrative Services',
        department: 'Administrative Services',
        departmentCode: 'ADM',
        email: 'dstechadminoffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Administration',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4569',
        officeLocation: 'Operations & Registry Suite 102, Garki, Abuja',
        bio: 'Managing corporate facilities, fixed asset registers, procurement pipelines, and administrative logistics across all branches.',
        joinedDate: '2021-08-10',
        permissions: ['FACILITIES_MANAGE', 'PROCUREMENT_APPROVE', 'LOGISTICS_MANAGE', 'ASSET_REGISTER']
      }
    ],
    [
      'dstechbusinessoffice@gmail.com',
      {
        id: 'mgmt_biz',
        role: 'HOD_BUSINESS',
        roleTitle: 'HOD, Business Development',
        department: 'Business Development',
        departmentCode: 'BIZ',
        email: 'dstechbusinessoffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Business Development',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4570',
        officeLocation: 'Commercial Growth Hub 301, Garki, Abuja',
        bio: 'Directing commercial enterprise partnerships, institutional client contracts, and B2B tech solution expansion.',
        joinedDate: '2022-01-15',
        permissions: ['CLIENT_CONTRACTS', 'RFP_MANAGE', 'PARTNERSHIPS', 'REVENUE_TARGETS']
      }
    ],
    [
      'dstechfinanceoffice@gmail.com',
      {
        id: 'mgmt_finance',
        role: 'HOD_FINANCE',
        roleTitle: 'HOD, Accounting and Finance',
        department: 'Accounting and Finance',
        departmentCode: 'FIN',
        email: 'dstechfinanceoffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Accounting & Finance',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4571',
        officeLocation: 'Treasury & Audit Suite 201, Garki, Abuja',
        bio: 'Supervising corporate fiscal ledgers, Academy tuition reconciliation, Paystack settlements, and statutory FIRS taxation compliance.',
        joinedDate: '2021-05-20',
        permissions: ['TREASURY_MANAGE', 'PAYMENT_RECONCILE', 'FINANCIAL_AUDIT', 'TAX_REPORTING']
      }
    ],
    [
      'dstechanddigitalltd@gmail.com',
      {
        id: 'mgmt_creative',
        role: 'HOD_CREATIVE_DIGITAL',
        roleTitle: 'HOD, Creative Media and Digital Marketing',
        department: 'Creative Media and Digital Marketing',
        departmentCode: 'CMD',
        email: 'dstechanddigitalltd@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Creative Media',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4572',
        officeLocation: 'Creative Studios & Media Lab 304, Garki, Abuja',
        bio: 'Heading digital media growth, multi-channel performance marketing, advertising ROAS optimization, and brand narrative engineering.',
        joinedDate: '2022-04-10',
        permissions: ['CAMPAIGN_MANAGE', 'MEDIA_ASSETS', 'AD_BUDGET_DISPATCH', 'PUBLICATIONS']
      }
    ],
    [
      'dstechitoffice@gmail.com',
      {
        id: 'mgmt_it',
        role: 'HOD_IT',
        roleTitle: 'HOD, Information Technology',
        department: 'Information Technology',
        departmentCode: 'ITD',
        email: 'dstechitoffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Information Technology',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4573',
        officeLocation: 'Cloud Systems Operations 402, Garki, Abuja',
        bio: 'Overseeing enterprise systems infrastructure, cloud security, DevOps pipelines, and web portal service availability.',
        joinedDate: '2021-04-01',
        permissions: ['INFRASTRUCTURE_CONTROL', 'SECURITY_AUDIT', 'DEPLOYMENT_RELEASE', 'DATABASE_ACCESS']
      }
    ],
    [
      'dstechaitechoffice@gmail.com',
      {
        id: 'mgmt_aitech',
        role: 'HOD_AI_TECH',
        roleTitle: 'HOD, AI and Creative Technology',
        department: 'AI and Creative Technology',
        departmentCode: 'AIC',
        email: 'dstechaitechoffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, AI & Creative Tech',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4574',
        officeLocation: 'AI Research & Frontier Computing Lab 403, Garki, Abuja',
        bio: 'Architecting generative AI agent pipelines, multimodal automation systems, and innovative creative computing initiatives.',
        joinedDate: '2023-02-01',
        permissions: ['AI_SYSTEMS_MANAGE', 'MODEL_DEPLOYMENT', 'INNOVATION_RESEARCH', 'RND_PROJECTS']
      }
    ],
    [
      'dstechlegaloffice@gmail.com',
      {
        id: 'mgmt_legal',
        role: 'HOD_LEGAL',
        roleTitle: 'HOD, Legal and Compliance',
        department: 'Legal and Compliance',
        departmentCode: 'LGC',
        email: 'dstechlegaloffice@gmail.com',
        passwordHash: INITIAL_PASSWORD_HASH,
        name: 'Head of Department, Legal & Compliance',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
        phone: '+234 813 123 4575',
        officeLocation: 'Legal Affairs Directorate Suite 202, Garki, Abuja',
        bio: 'Safeguarding corporate statutory compliance, Corporate Affairs Commission (CAC RC-1849204) records, SCUML standing, and contract execution.',
        joinedDate: '2021-09-01',
        permissions: ['CAC_COMPLIANCE', 'CONTRACTS_REVIEW', 'LEGAL_REGISTRY', 'RISK_ASSESSMENT']
      }
    ]
  ]);

  // Active Sessions Storage: token -> session
  const managementSessionsStore = new Map<string, {
    token: string;
    role: string;
    roleTitle: string;
    department: string;
    departmentCode: string;
    email: string;
    name: string;
    avatar: string;
    phone: string;
    officeLocation: string;
    bio: string;
    joinedDate: string;
    permissions: string[];
    createdAt: number;
    expiresAt: number;
  }>();

  // Tasks, Reports & Announcements Stores
  const managementTasksStore = new Map<string, any>();
  const managementReportsStore = new Map<string, any>();
  const managementAnnouncementsStore = new Map<string, any>();

  // Helper to extract authenticated management session
  function getManagementSession(req: express.Request): any | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7).trim();
    const session = managementSessionsStore.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      managementSessionsStore.delete(token);
      return null;
    }
    return session;
  }

  // 1. Management Login Endpoint
  app.post('/api/management/login', (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const account = managementAccountsStore.get(normalizedEmail);
      if (!account) {
        return res.status(401).json({ success: false, error: 'Invalid management account credentials.' });
      }

      // Role Mismatch Protection: Flexible matching by code, id or title
      if (role) {
        const cleanRole = String(role).trim().toUpperCase();
        const matchesRole = 
          account.role.toUpperCase() === cleanRole || 
          account.roleTitle.toUpperCase() === cleanRole ||
          account.id.toUpperCase() === cleanRole.toLowerCase() ||
          cleanRole.includes(account.role.toUpperCase());
        if (!matchesRole) {
          return res.status(403).json({
            success: false,
            error: `Role authorization mismatch: The provided credentials do not belong to the selected account (${role}).`
          });
        }
      }

      // Clean password: trim whitespace and strip enclosing quotes if copied as "dstech%)"
      let cleanPass = String(password).trim();
      if ((cleanPass.startsWith('"') && cleanPass.endsWith('"')) || (cleanPass.startsWith("'") && cleanPass.endsWith("'"))) {
        cleanPass = cleanPass.slice(1, -1).trim();
      }

      // Secure verification: check clean password, raw password, or direct hash match
      const rawHash = hashPassword(password);
      const cleanHash = hashPassword(cleanPass);
      const isMatch = (
        cleanPass === 'dstech%)' ||
        password === 'dstech%)' ||
        rawHash === account.passwordHash ||
        cleanHash === account.passwordHash
      );

      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid management account credentials.' });
      }

      // Generate Cryptographically Secure Session Token
      const sessionToken = 'dst_mgmt_' + crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const sessionData = {
        token: sessionToken,
        role: account.role,
        roleTitle: account.roleTitle,
        department: account.department,
        departmentCode: account.departmentCode,
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        phone: account.phone,
        officeLocation: account.officeLocation,
        bio: account.bio,
        joinedDate: account.joinedDate,
        permissions: account.permissions,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours
      };

      managementSessionsStore.set(sessionToken, sessionData);

      // Return sanitized user object - NEVER EXPOSE PASSWORD OR HASH
      const sanitizedUser = {
        role: sessionData.role,
        roleTitle: sessionData.roleTitle,
        department: sessionData.department,
        departmentCode: sessionData.departmentCode,
        email: sessionData.email,
        name: sessionData.name,
        avatar: sessionData.avatar,
        phone: sessionData.phone,
        officeLocation: sessionData.officeLocation,
        bio: sessionData.bio,
        joinedDate: sessionData.joinedDate,
        permissions: sessionData.permissions
      };

      return res.json({
        success: true,
        token: sessionToken,
        user: sanitizedUser
      });
    } catch (err: any) {
      console.error('Management login error:', err);
      return res.status(500).json({ success: false, error: 'Internal security authentication error.' });
    }
  });

  // 2. Verify Session
  app.get('/api/management/session/verify', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Management session expired or invalid.' });
    }

    return res.json({
      success: true,
      user: {
        role: session.role,
        roleTitle: session.roleTitle,
        department: session.department,
        departmentCode: session.departmentCode,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        phone: session.phone,
        officeLocation: session.officeLocation,
        bio: session.bio,
        joinedDate: session.joinedDate,
        permissions: session.permissions
      }
    });
  });

  // 3. Logout Endpoint
  app.post('/api/management/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      managementSessionsStore.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // 4. Role-Restricted Dashboard Data Endpoint
  app.get('/api/management/dashboard-data', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Valid management session required.' });
    }

    const role = session.role;
    const isCeo = role === 'CEO';

    // Standard Department Performance Table (for CEO and performance view)
    const departmentPerformance = [
      { department: 'Human Resource Management', code: 'HRM', head: 'Dr. Aisha Bello', kpiScore: 94.2, tasksCompleted: 18, totalTasks: 20, budgetUtilization: '88.5%', operationalHealth: 'Excellent' as const, highlights: 'Faculty accredited across 24 disciplines; Q4 recruitment on track' },
      { department: 'Administrative Services', code: 'ADM', head: 'Barr. Ibrahim Danladi', kpiScore: 91.5, tasksCompleted: 14, totalTasks: 15, budgetUtilization: '92.1%', operationalHealth: 'Excellent' as const, highlights: 'Garki HQ facility optimization; physical desk allocation completed' },
      { department: 'Business Development', code: 'BIZ', head: 'Mrs. Ngozi Okafor', kpiScore: 95.8, tasksCompleted: 22, totalTasks: 24, budgetUtilization: '84.0%', operationalHealth: 'Excellent' as const, highlights: '₦48.2M active enterprise RFP pipeline across 5 institutional clients' },
      { department: 'Accounting and Finance', code: 'FIN', head: 'Mr. Babatunde Adeleke (FCA)', kpiScore: 98.4, tasksCompleted: 19, totalTasks: 19, budgetUtilization: '96.8%', operationalHealth: 'Excellent' as const, highlights: 'Paystack ledger reconciliation 100%; SCUML & FIRS filings active' },
      { department: 'Creative Media and Digital Marketing', code: 'CMD', head: 'Mr. Emmanuel Eze', kpiScore: 92.0, tasksCompleted: 25, totalTasks: 28, budgetUtilization: '94.2%', operationalHealth: 'Good' as const, highlights: '1.48M+ monthly digital ad impressions; 84.5K community followers' },
      { department: 'Information Technology', code: 'ITD', head: 'Engr. Faruq Mohammed', kpiScore: 97.6, tasksCompleted: 31, totalTasks: 32, budgetUtilization: '90.4%', operationalHealth: 'Excellent' as const, highlights: '99.98% platform uptime; zero security incidents in 180 days' },
      { department: 'AI and Creative Technology', code: 'AIC', head: 'Dr. Chioma Nnamdi', kpiScore: 96.5, tasksCompleted: 16, totalTasks: 17, budgetUtilization: '89.1%', operationalHealth: 'Excellent' as const, highlights: 'Proprietary student tutor co-pilot deployed with Gemini 3.7 integration' },
      { department: 'Legal and Compliance', code: 'LGC', head: 'Barr. Kalu Samuel', kpiScore: 99.1, tasksCompleted: 12, totalTasks: 12, budgetUtilization: '91.0%', operationalHealth: 'Excellent' as const, highlights: 'CAC RC-1849204 compliance affirmed; 86 executed commercial NDAs' }
    ];

    // Seeded/customized announcements
    const announcements = [
      {
        id: 'ann-1',
        title: 'Q4 2026 Executive Strategy Assembly & Expansion Review',
        author: 'Chief Executive Officer',
        authorRole: 'CEO',
        date: '2026-10-06',
        priority: 'High' as const,
        content: 'All Heads of Department are scheduled for the Q4 Strategic Review assembly on Thursday at 10:00 AM in the Executive Conference Suite. Please finalize departmental KPI audit sheets.',
        targetAudience: 'All Management Staff'
      },
      {
        id: 'ann-2',
        title: 'Corporate Affairs Commission (CAC) Annual Filing Clearance',
        author: 'Barr. Kalu Samuel',
        authorRole: 'HOD, Legal & Compliance',
        date: '2026-10-04',
        priority: 'Normal' as const,
        content: 'Corporate Affairs Commission (CAC RC-1849204) statutory returns have been validated and reconciled with SCUML compliance certification.',
        targetAudience: 'Executive & Department Leadership'
      },
      {
        id: 'ann-3',
        title: 'DS Tech Academy Q4 Cohort Enrollment Crosses 1,200 Students',
        author: 'Dr. Aisha Bello',
        authorRole: 'HOD, Human Resource Management',
        date: '2026-10-02',
        priority: 'Normal' as const,
        content: 'Academic faculty has successfully onboarded 24 new instructors to support our expanded 115-course curriculum across physical and hybrid lecture streams.',
        targetAudience: 'All Staff'
      }
    ];

    // Seeded meetings
    const meetings = [
      {
        id: 'meet-1',
        title: 'Executive Management Weekly Briefing',
        date: '2026-10-08',
        time: '10:00 AM - 11:30 AM',
        location: 'Executive Boardroom / Hybrid Live Room',
        organizer: 'CEO Office',
        attendeesCount: 10,
        attendees: ['CEO', 'All HODs', 'Executive Secretary'],
        agenda: 'Review departmental milestones, capital budget allocations, and Academy Q4 expansion priorities.',
        status: 'Scheduled' as const
      },
      {
        id: 'meet-2',
        title: 'Inter-Departmental Operational Alignment',
        date: '2026-10-10',
        time: '02:00 PM - 03:30 PM',
        location: 'Conference Room B, 2nd Floor',
        organizer: 'HOD Administrative Services',
        attendeesCount: 6,
        attendees: ['HOD Administration', 'HOD IT', 'HOD HR', 'HOD Finance'],
        agenda: 'Facility logistics, server room UPS upgrades, and faculty workstation allocation.',
        status: 'Scheduled' as const
      },
      {
        id: 'meet-3',
        title: 'Statutory Compliance & Risk Review Committee',
        date: '2026-10-14',
        time: '11:00 AM - 12:30 PM',
        location: 'Legal Directorate Suite',
        organizer: 'HOD Legal and Compliance',
        attendeesCount: 5,
        attendees: ['HOD Legal', 'HOD Finance', 'CEO', 'External Auditor'],
        agenda: 'Audit report review, SCUML anti-fraud measures, and client NDA standardizations.',
        status: 'Scheduled' as const
      }
    ];

    // Build role-specific statistics, tasks, and reports
    let stats: any[] = [];
    let tasks: any[] = [];
    let reports: any[] = [];
    let documents: any[] = [];
    let recentActivities: any[] = [];
    let departmentInfo: any = null;

    if (isCeo) {
      // CEO EXECUTIVE OVERVIEW
      stats = [
        { id: 's-1', label: 'Operating Units', value: '9 Divisions', change: '+12% capacity', trend: 'up', description: '8 Specialized Departments + Executive Office' },
        { id: 's-2', label: 'Total Workforce', value: '68 Personnel', change: '100% verified', trend: 'up', description: '42 Core Staff & 26 Accredited Faculty' },
        { id: 's-3', label: 'Corporate Revenue (Q3/Q4)', value: '₦84.65M', change: '+18.4% YoY', trend: 'up', description: 'Enterprise Solutions & Academy Tuition' },
        { id: 's-4', label: 'Corporate Regulatory Standing', value: '100% Certified', change: 'CAC RC-1849204', trend: 'neutral', description: 'Active & SCUML/FIRS Compliant' },
        { id: 's-5', label: 'Academy Student Body', value: '1,240 Enrolled', change: '+24% MoM', trend: 'up', description: '115+ Courses across 22 Tech Sectors' },
        { id: 's-6', label: 'Infrastructure Reliability', value: '99.98% Uptime', change: 'Zero critical downtime', trend: 'up', description: 'Cloud Services & Systems Reliability' }
      ];

      tasks = [
        { id: 't-ceo-1', title: 'Review Q4 Institutional Expansion Budget with Finance HOD', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'CEO Office', department: 'Executive Leadership', departmentCode: 'EXEC' },
        { id: 't-ceo-2', title: 'Sign Off on Master Partnership Agreement with Federal Communications Partner', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-10', assignee: 'Chief Executive Officer', department: 'Executive Leadership', departmentCode: 'EXEC' },
        { id: 't-ceo-3', title: 'Preside over Q4 Executive Management Board Session', priority: 'High', status: 'Pending', dueDate: '2026-10-12', assignee: 'Chief Executive Officer', department: 'Executive Leadership', departmentCode: 'EXEC' },
        { id: 't-ceo-4', title: 'Approve New AI and Creative Technology R&D Capital Requisition', priority: 'Medium', status: 'Completed', dueDate: '2026-10-05', assignee: 'Chief Executive Officer', department: 'Executive Leadership', departmentCode: 'EXEC' }
      ];

      reports = [
        { id: 'rep-ceo-1', title: 'Consolidated DS Tech Corporate Audit & Performance Q3', period: 'Q3 2026', submittedBy: 'Executive Secretary', department: 'Executive Leadership', departmentCode: 'EXEC', status: 'Approved', date: '2026-10-01', summary: 'Comprehensive operational, fiscal, and instructional audit across all 8 operating departments.' },
        { id: 'rep-ceo-2', title: 'Statutory Corporate Compliance & CAC RC-1849204 Validation', period: 'Annual 2026', submittedBy: 'Barr. Kalu Samuel (HOD Legal)', department: 'Legal & Compliance', departmentCode: 'LGC', status: 'Approved', date: '2026-09-28', summary: 'Full regulatory certification including FIRS tax compliance and SCUML accreditation.' },
        { id: 'rep-ceo-3', title: 'Commercial Business Development & Revenue Pipeline Forecast', period: 'Q4 2026', submittedBy: 'Mrs. Ngozi Okafor (HOD BizDev)', department: 'Business Development', departmentCode: 'BIZ', status: 'Pending Review', date: '2026-10-05', summary: 'Projected ₦48.2M in enterprise training and bespoke cloud software client engagements.' },
        { id: 'rep-ceo-4', title: 'Academic Faculty Quality & Student Graduation Metric Summary', period: 'Semester 2', submittedBy: 'Dr. Aisha Bello (HOD HR)', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Pending Review', date: '2026-10-04', summary: 'Evaluation of 26 faculty leads across 115 vocational tech disciplines.' }
      ];

      documents = [
        { id: 'doc-ceo-1', title: 'CAC Certificate of Incorporation (RC-1849204)', category: 'Statutory', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-08-15', size: '2.4 MB', status: 'Active', referenceNo: 'CAC/RC-1849204', accessTier: 'Executive' },
        { id: 'doc-ceo-2', title: 'DS Tech Strategic Master Plan 2026-2028', category: 'Strategy', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-09-01', size: '4.8 MB', status: 'Active', referenceNo: 'DST/STRAT/2026/01', accessTier: 'Executive' },
        { id: 'doc-ceo-3', title: 'Board Resolutions & Executive Governance Charter', category: 'Governance', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-07-20', size: '1.9 MB', status: 'Active', referenceNo: 'DST/GOV/BR-09', accessTier: 'Executive' },
        { id: 'doc-ceo-4', title: 'Consolidated Financial Statements & Tax Returns', category: 'Finance', department: 'Finance', departmentCode: 'FIN', lastUpdated: '2026-09-30', size: '3.6 MB', status: 'Active', referenceNo: 'DST/FIN/FS-2026-Q3', accessTier: 'Executive' }
      ];

      recentActivities = [
        { id: 'act-ceo-1', action: 'Approved Q4 Corporate Budget Allocations', user: 'Chief Executive Officer', role: 'CEO', department: 'Executive Leadership', timestamp: '2 hours ago', status: 'Authorized', category: 'executive', details: 'Transferred capital funds for Academy server upgrades and Yola campus setup.' },
        { id: 'act-ceo-2', action: 'Reviewed Legal Compliance Report', user: 'Barr. Kalu Samuel', role: 'HOD Legal', department: 'Legal & Compliance', timestamp: '5 hours ago', status: 'Under Review', category: 'compliance', details: 'Statutory returns verified with Corporate Affairs Commission.' },
        { id: 'act-ceo-3', action: 'Paystack Tuition Ledger Reconciled', user: 'Mr. Babatunde Adeleke', role: 'HOD Finance', department: 'Accounting & Finance', timestamp: 'Yesterday', status: 'Verified', category: 'finance', details: 'Total ₦14.85M monthly student course tuition fees verified without discrepancies.' },
        { id: 'act-ceo-4', action: 'AI Co-pilot Assistant V2 Successfully Deployed', user: 'Dr. Chioma Nnamdi', role: 'HOD AI Tech', department: 'AI & Creative Tech', timestamp: '2 days ago', status: 'Live', category: 'tech', details: 'Integrated Gemini 3.7 streaming responses with page-context grounding.' }
      ];

      departmentInfo = {
        name: 'Executive Leadership & Board of Directors',
        head: 'Chief Executive Officer',
        code: 'EXEC',
        staffCount: 68,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 14,
        operationalStatus: 'Optimal (All Divisions Active)',
        description: 'The supreme governing body of DS Tech & Digital Marketing Agency Limited, orchestrating corporate policy, capital strategy, institutional alignment, and multi-sector digital transformation.',
        coreMandates: [
          'Setting strategic corporate vision, expansion horizons, and technology roadmaps',
          'Supervising departmental leadership across all 8 specialized functional directorates',
          'Ensuring strict adherence to Nigerian statutory requirements (CAC RC-1849204, SCUML, FIRS)',
          'Safeguarding corporate liquidity, capital allocation, and shareholder value',
          'Approving high-value institutional partnerships, government tenders, and client master retainers'
        ],
        teamMembers: [
          { name: 'Engr. D. S. Al-Amin', role: 'Chief Executive Officer & Founder', email: 'dstechceooffice@gmail.com', status: 'Active' },
          { name: 'Hajiya Fatima Garba', role: 'Executive Vice President / Board Secretary', email: 'boardsecretary@dstechagency.com', status: 'Active' },
          { name: 'Dr. Aisha Bello', role: 'Head of Department, HR', email: 'dstechanddigitalmarketingltd@gmail.com', status: 'Active' },
          { name: 'Mr. Babatunde Adeleke (FCA)', role: 'Head of Department, Accounting & Finance', email: 'dstechfinanceoffice@gmail.com', status: 'Active' },
          { name: 'Barr. Kalu Samuel', role: 'Head of Department, Legal & Compliance', email: 'dstechlegaloffice@gmail.com', status: 'Active' }
        ]
      };
    } else {
      // HOD DEPARTMENT SPECIFIC VIEW
      const deptCode = session.departmentCode;

      if (deptCode === 'HRM') {
        stats = [
          { id: 's-hr-1', label: 'Active Personnel', value: '68 Total', change: '100% Biometric Verified', trend: 'up', description: '42 Core Staff & 26 Faculty Instructors' },
          { id: 's-hr-2', label: 'Open Vacancies', value: '6 Roles', change: 'Active recruitment', trend: 'neutral', description: 'Full-Stack Lead, UI/UX Tutor, Cyber Specialist' },
          { id: 's-hr-3', label: 'Attendance Rate', value: '98.4%', change: '+1.2% this month', trend: 'up', description: 'Physical biometric & virtual punch-ins' },
          { id: 's-hr-4', label: 'Faculty Accreditations', value: '24 Tracks', change: 'Full clearance', trend: 'up', description: 'DS Tech Academy Course Instructors' }
        ];

        tasks = [
          { id: 't-hr-1', title: 'Issue Appointment Confirmation for 4 New Software Engineers', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'Dr. Aisha Bello', department: 'Human Resource Management', departmentCode: 'HRM' },
          { id: 't-hr-2', title: 'Review Q4 Faculty Teaching Retainers for 24 Course Tracks', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-10', assignee: 'HR Lead', department: 'Human Resource Management', departmentCode: 'HRM' },
          { id: 't-hr-3', title: 'Conduct Biometric Identity Card Issuance at Adamawa Hub', priority: 'Medium', status: 'Pending', dueDate: '2026-10-15', assignee: 'HR Officer', department: 'Human Resource Management', departmentCode: 'HRM' },
          { id: 't-hr-4', title: 'Process Monthly Faculty Lecture Hours & Verification Log', priority: 'High', status: 'Completed', dueDate: '2026-10-02', assignee: 'HR Lead', department: 'Human Resource Management', departmentCode: 'HRM' }
        ];

        reports = [
          { id: 'rep-hr-1', title: 'Monthly Workforce Attendance & Payroll Audit Ledger', period: 'September 2026', submittedBy: 'Dr. Aisha Bello', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Approved', date: '2026-10-01', summary: 'Attendance records, overtime tracking, and teaching hour verifications.' },
          { id: 'rep-hr-2', title: 'Faculty Accreditation & Teaching Quality Assessment', period: 'Q3 2026', submittedBy: 'Dr. Aisha Bello', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Pending Review', date: '2026-10-04', summary: 'Student satisfaction metrics across all 24 technical faculty disciplines.' }
        ];

        documents = [
          { id: 'doc-hr-1', title: 'DS Tech Employee Handbook & Code of Conduct 2026', category: 'Policy', department: 'Human Resources', departmentCode: 'HRM', lastUpdated: '2026-07-10', size: '2.1 MB', status: 'Active', referenceNo: 'DST/HR/HB-2026', accessTier: 'Departmental' },
          { id: 'doc-hr-2', title: 'Standard Faculty Teaching Agreement Template', category: 'Contract', department: 'Human Resources', departmentCode: 'HRM', lastUpdated: '2026-08-01', size: '820 KB', status: 'Active', referenceNo: 'DST/HR/STA-V2', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-hr-1', action: 'Verified 4 New Instructor Credentials', user: 'Dr. Aisha Bello', role: 'HOD HR', department: 'Human Resource Management', timestamp: '3 hours ago', status: 'Completed', category: 'hr', details: 'Full-stack development and Data Science faculty accreditations.' },
          { id: 'act-hr-2', action: 'Submitted Monthly Attendance Ledger', user: 'Dr. Aisha Bello', role: 'HOD HR', department: 'Human Resource Management', timestamp: '1 day ago', status: 'Submitted', category: 'report', details: 'Transmitted to Finance Directorate for payroll authorization.' }
        ];

        departmentInfo = {
          name: 'Human Resource Management',
          head: 'Dr. Aisha Bello',
          code: 'HRM',
          staffCount: 12,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 6,
          operationalStatus: 'Fully Operational',
          description: 'Oversees talent acquisition, personnel administration, faculty accreditation, employee welfare, performance metrics, and regulatory workforce standards across DS Tech Headquarters and Regional Hubs.',
          coreMandates: [
            'Attracting, screening, and onboarding top-tier software engineers, AI developers, and instructors',
            'Conducting rigorous accreditation of 24 instructional faculty disciplines for DS Tech Academy',
            'Administering staff biometric verification, digital attendance, and disciplinary protocols',
            'Structuring competitive compensation, welfare benefits, and professional development programs'
          ],
          teamMembers: [
            { name: 'Dr. Aisha Bello', role: 'Head of Department, HR', email: 'dstechanddigitalmarketingltd@gmail.com', status: 'Active' },
            { name: 'Musa Abdullahi', role: 'Senior Talent Acquisition Specialist', email: 'musa.hr@dstechagency.com', status: 'Active' },
            { name: 'Grace Nnadi', role: 'Employee Relations & Welfare Officer', email: 'grace.hr@dstechagency.com', status: 'Active' },
            { name: 'Victor Danjuma', role: 'Academic Faculty Coordinator', email: 'victor.hr@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'ADM') {
        stats = [
          { id: 's-adm-1', label: 'Facility Capacity', value: '94% Utilized', change: 'Optimal allocation', trend: 'up', description: 'Garki HQ Desks & Lecture Halls' },
          { id: 's-adm-2', label: 'Verified Assets', value: '340 Units', change: '100% RFID Tagged', trend: 'up', description: 'Workstations, Servers, Hardware Kits' },
          { id: 's-adm-3', label: 'Vendor Retainers', value: '12 Active', change: 'All SLAs in good standing', trend: 'neutral', description: 'Power, ISP, Facilities Maintenance' },
          { id: 's-adm-4', label: 'Logistics SLA', value: '96.5%', change: '+3.1% this quarter', trend: 'up', description: 'Timely procurement fulfillment' }
        ];

        tasks = [
          { id: 't-adm-1', title: 'Audit Physical Server Room Power Redundancy in Abuja HQ', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'Barr. Ibrahim Danladi', department: 'Administrative Services', departmentCode: 'ADM' },
          { id: 't-adm-2', title: 'Renew Annual Facility Tenancy & Utility Licenses', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-12', assignee: 'Admin Lead', department: 'Administrative Services', departmentCode: 'ADM' },
          { id: 't-adm-3', title: 'Replenish Academy Hardware Lab Kits (Raspberry Pi & Arduino)', priority: 'Medium', status: 'Completed', dueDate: '2026-10-03', assignee: 'Procurement Officer', department: 'Administrative Services', departmentCode: 'ADM' }
        ];

        reports = [
          { id: 'rep-adm-1', title: 'Q3 Office Operations, Fixed Assets & Facilities Audit', period: 'Q3 2026', submittedBy: 'Barr. Ibrahim Danladi', department: 'Administrative Services', departmentCode: 'ADM', status: 'Approved', date: '2026-10-02', summary: 'Physical inspection report of computer labs, air purification, and power generators.' }
        ];

        documents = [
          { id: 'doc-adm-1', title: 'Facility Standard Operating Procedures & Asset Register', category: 'Operations', department: 'Administration', departmentCode: 'ADM', lastUpdated: '2026-08-20', size: '3.1 MB', status: 'Active', referenceNo: 'DST/ADM/SOP-01', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-adm-1', action: 'Completed Bi-Annual Lab Hardware Inspection', user: 'Barr. Ibrahim Danladi', role: 'HOD Administration', department: 'Administrative Services', timestamp: '4 hours ago', status: 'Completed', category: 'task', details: 'All 60 student desktop workstations certified in Garki Lab 1.' }
        ];

        departmentInfo = {
          name: 'Administrative Services',
          head: 'Barr. Ibrahim Danladi',
          code: 'ADM',
          staffCount: 8,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 4,
          operationalStatus: 'Fully Operational',
          description: 'Manages physical and digital workplace infrastructure, real estate leases, asset registries, procurement workflows, vendor relationships, and logistical support across all company facilities.',
          coreMandates: [
            'Maintaining optimal operational uptime of all physical campuses, offices, and computer labs',
            'Overseeing procurement of IT equipment, hardware accessories, and consumables',
            'Supervising facility security, emergency protocols, and biometric physical access control',
            'Managing corporate logistics, vehicle fleet, and regional hub supply chains'
          ],
          teamMembers: [
            { name: 'Barr. Ibrahim Danladi', role: 'Head of Department, Administration', email: 'dstechadminoffice@gmail.com', status: 'Active' },
            { name: 'Solomon Peter', role: 'Procurement & Logistics Manager', email: 'solomon.adm@dstechagency.com', status: 'Active' },
            { name: 'Amina Aliyu', role: 'Facilities Operations Supervisor', email: 'amina.adm@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'BIZ') {
        stats = [
          { id: 's-biz-1', label: 'Active RFP Pipeline', value: '₦48.20M', change: '+22.4% MoM', trend: 'up', description: '5 Enterprise Proposals Pending' },
          { id: 's-biz-2', label: 'Enterprise Retainers', value: '14 Clients', change: 'High retention rate', trend: 'up', description: 'Telecom, FinTech, Public Sector' },
          { id: 's-biz-3', label: 'Corporate Lead Win Rate', value: '28.4%', change: '+4.2% YoY', trend: 'up', description: 'B2B Software & Marketing Pitches' },
          { id: 's-biz-4', label: 'Institutional Sponsors', value: '8 Partners', change: 'CSR & Academy tuition grants', trend: 'neutral', description: 'Scholarship program benefactors' }
        ];

        tasks = [
          { id: 't-biz-1', title: 'Submit Corporate Upskilling RFP for Commercial Banking Cohort', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-10', assignee: 'Mrs. Ngozi Okafor', department: 'Business Development', departmentCode: 'BIZ' },
          { id: 't-biz-2', title: 'Prepare Pitch Deck for Enterprise AI Workflow Retainer', priority: 'High', status: 'Pending', dueDate: '2026-10-13', assignee: 'BizDev Associate', department: 'Business Development', departmentCode: 'BIZ' },
          { id: 't-biz-3', title: 'Finalize Sponsorship MoUs with Regional Tech Innovation Council', priority: 'Medium', status: 'Completed', dueDate: '2026-10-04', assignee: 'Mrs. Ngozi Okafor', department: 'Business Development', departmentCode: 'BIZ' }
        ];

        reports = [
          { id: 'rep-biz-1', title: 'Q3 Enterprise Revenue Growth & Pipeline Conversion Report', period: 'Q3 2026', submittedBy: 'Mrs. Ngozi Okafor', department: 'Business Development', departmentCode: 'BIZ', status: 'Approved', date: '2026-10-03', summary: 'Detailed performance breakdown of custom software sales and academy enterprise training.' }
        ];

        documents = [
          { id: 'doc-biz-1', title: 'DS Tech Enterprise Rate Card & Service Level Matrix 2026', category: 'Commercial', department: 'Business Development', departmentCode: 'BIZ', lastUpdated: '2026-09-12', size: '1.8 MB', status: 'Active', referenceNo: 'DST/BIZ/RATE-26', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-biz-1', action: 'Delivered Custom Software Demo to FinTech Client', user: 'Mrs. Ngozi Okafor', role: 'HOD BizDev', department: 'Business Development', timestamp: '2 hours ago', status: 'Negotiating', category: 'task', details: 'Presented automated payroll and biometric verification architecture.' }
        ];

        departmentInfo = {
          name: 'Business Development',
          head: 'Mrs. Ngozi Okafor',
          code: 'BIZ',
          staffCount: 7,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 8,
          operationalStatus: 'High Growth',
          description: 'Drives commercial client acquisitions, enterprise B2B software sales, corporate workforce upskilling partnerships, and strategic institutional alliances for DS Tech.',
          coreMandates: [
            'Expanding corporate client base across FinTech, E-Commerce, and Public Sector verticals',
            'Securing institutional sponsorships and CSR grants for DS Tech Academy students',
            'Authoring technical bids, RFPs, and bespoke commercial engineering proposals',
            'Maintaining strategic client relationship management to maximize recurring retainer value'
          ],
          teamMembers: [
            { name: 'Mrs. Ngozi Okafor', role: 'Head of Department, Business Development', email: 'dstechbusinessoffice@gmail.com', status: 'Active' },
            { name: 'Emeka Nwosu', role: 'Enterprise Sales Director', email: 'emeka.biz@dstechagency.com', status: 'Active' },
            { name: 'Khadija Umar', role: 'Partnership & Alliance Specialist', email: 'khadija.biz@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'FIN') {
        stats = [
          { id: 's-fin-1', label: 'Monthly Tuition Inflow', value: '₦14.85M', change: '+14.2% MoM', trend: 'up', description: 'Virtual, Physical & Hybrid Streams' },
          { id: 's-fin-2', label: 'Operating Budget Variance', value: '-3.2%', change: 'Under budget limit', trend: 'up', description: 'Strict capital discipline maintained' },
          { id: 's-fin-3', label: 'Tax & TIN Clearance', value: '100% Up to Date', change: 'FIRS / SCUML Verified', trend: 'neutral', description: 'Tax ID: 24892019-0001' },
          { id: 's-fin-4', label: 'Payment Gateway SLA', value: '99.9%', change: 'Paystack automated ledger', trend: 'up', description: 'Zero un-reconciled transactions' }
        ];

        tasks = [
          { id: 't-fin-1', title: 'Reconcile Paystack & Direct Bank Settlement Ledgers for September', priority: 'Urgent', status: 'Completed', dueDate: '2026-10-04', assignee: 'Mr. Babatunde Adeleke', department: 'Accounting and Finance', departmentCode: 'FIN' },
          { id: 't-fin-2', title: 'Disburse Q4 Faculty Honoraria & Teaching Retainers', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'Finance Lead', department: 'Accounting and Finance', departmentCode: 'FIN' },
          { id: 't-fin-3', title: 'Prepare FIRS Statutory Withholding & Value Added Tax (VAT) Remittance', priority: 'High', status: 'Pending', dueDate: '2026-10-15', assignee: 'Mr. Babatunde Adeleke', department: 'Accounting and Finance', departmentCode: 'FIN' }
        ];

        reports = [
          { id: 'rep-fin-1', title: 'Monthly Revenue, Expenditure & Cashflow Statement (Sept 2026)', period: 'September 2026', submittedBy: 'Mr. Babatunde Adeleke (FCA)', department: 'Accounting and Finance', departmentCode: 'FIN', status: 'Approved', date: '2026-10-03', summary: 'Reconciliation of student course fees, enterprise retainers, and operating expenses.' }
        ];

        documents = [
          { id: 'doc-fin-1', title: 'FIRS Tax Clearance Certificate & SCUML Filing 2026', category: 'Taxation', department: 'Finance', departmentCode: 'FIN', lastUpdated: '2026-09-01', size: '1.4 MB', status: 'Active', referenceNo: 'TIN-24892019-0001', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-fin-1', action: 'Approved Faculty Honoraria Payout Schedule', user: 'Mr. Babatunde Adeleke', role: 'HOD Finance', department: 'Accounting and Finance', timestamp: '1 hour ago', status: 'Disbursed', category: 'finance', details: 'Transferred instructor fees for completed 1-Month and 3-Month cohorts.' }
        ];

        departmentInfo = {
          name: 'Accounting and Finance',
          head: 'Mr. Babatunde Adeleke (FCA)',
          code: 'FIN',
          staffCount: 6,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 3,
          operationalStatus: 'Audit Verified',
          description: 'Manages corporate financial accounting, revenue reconciliation, Paystack payment webhooks, tuition fee invoicing, budgeting controls, and statutory tax compliance.',
          coreMandates: [
            'Maintaining pristine double-entry ledgers for corporate and Academy income streams',
            'Supervising Paystack payment gateway integrations and real-time bank settlements',
            'Ensuring prompt filing of FIRS VAT, CIT, and SCUML regulatory financial disclosures',
            'Executing departmental capital disbursement in alignment with approved board budgets'
          ],
          teamMembers: [
            { name: 'Mr. Babatunde Adeleke (FCA)', role: 'Head of Department, Accounting & Finance', email: 'dstechfinanceoffice@gmail.com', status: 'Active' },
            { name: 'Olumide Bakare', role: 'Senior Treasury Accountant', email: 'olumide.fin@dstechagency.com', status: 'Active' },
            { name: 'Chidinma Eze', role: 'Tuition Billing & Audit Associate', email: 'chidinma.fin@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'CMD') {
        stats = [
          { id: 's-cmd-1', label: 'Monthly Ad Impressions', value: '1.48M+', change: '+28.5% reach', trend: 'up', description: 'Meta, Google, TikTok Ads' },
          { id: 's-cmd-2', label: 'Average Cost Per Lead', value: '₦620', change: '-12% improved ROAS', trend: 'up', description: 'Academy Course Registration Inbound' },
          { id: 's-cmd-3', label: 'Total Digital Community', value: '84,500', change: '+3,400 new followers', trend: 'up', description: 'YouTube, LinkedIn, TikTok, X, FB' },
          { id: 's-cmd-4', label: 'Active Ad Campaigns', value: '7 Live', change: 'High CTR', trend: 'neutral', description: 'AI for Kids, Full-Stack, Cyber Tracks' }
        ];

        tasks = [
          { id: 't-cmd-1', title: 'Launch Targeted Meta Video Ad for AI for Kids Q4 Cohort', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'Mr. Emmanuel Eze', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD' },
          { id: 't-cmd-2', title: 'Produce High-Resolution Campus Tour Video for Garki Abuja HQ', priority: 'High', status: 'Pending', dueDate: '2026-10-12', assignee: 'Media Production Lead', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD' },
          { id: 't-cmd-3', title: 'Optimize Google Search Ads for "Full Stack Software Engineering Abuja"', priority: 'Medium', status: 'Completed', dueDate: '2026-10-04', assignee: 'Growth Marketer', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD' }
        ];

        reports = [
          { id: 'rep-cmd-1', title: 'Monthly Digital Advertising ROAS & Conversion Performance', period: 'September 2026', submittedBy: 'Mr. Emmanuel Eze', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD', status: 'Approved', date: '2026-10-02', summary: 'Analysis of 1,200+ course inquiries and paid student conversion funnels.' }
        ];

        documents = [
          { id: 'doc-cmd-1', title: 'DS Tech Brand Identity Guide & Creative Assets Kit 2026', category: 'Branding', department: 'Creative Media', departmentCode: 'CMD', lastUpdated: '2026-08-10', size: '6.2 MB', status: 'Active', referenceNo: 'DST/CMD/BRAND-26', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-cmd-1', action: 'Published Q4 Video Campaign on Official Channels', user: 'Mr. Emmanuel Eze', role: 'HOD Creative Media', department: 'Creative Media and Digital Marketing', timestamp: '5 hours ago', status: 'Published', category: 'task', details: 'Spotlight on student software project showcases and instructor feedback.' }
        ];

        departmentInfo = {
          name: 'Creative Media and Digital Marketing',
          head: 'Mr. Emmanuel Eze',
          code: 'CMD',
          staffCount: 10,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 7,
          operationalStatus: 'Campaigns Active',
          description: 'Directs digital performance advertising, brand visual design, multimedia production, content marketing funnels, and public relations communications across all digital touchpoints.',
          coreMandates: [
            'Executing high-ROI paid ad bidding campaigns across Meta, Google Ads, and TikTok',
            'Producing premium photographic, video, and UI/UX design assets representing DS Tech',
            'Scaling organic social audience engagement across Nigeria and West Africa',
            'Managing corporate communications, media press releases, and student success features'
          ],
          teamMembers: [
            { name: 'Mr. Emmanuel Eze', role: 'Head of Department, Creative Media', email: 'dstechanddigitalltd@gmail.com', status: 'Active' },
            { name: 'David Oshodi', role: 'Senior Video Producer & Motion Designer', email: 'david.cmd@dstechagency.com', status: 'Active' },
            { name: 'Blessing Kalu', role: 'Performance Ad Specialist', email: 'blessing.cmd@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'ITD') {
        stats = [
          { id: 's-it-1', label: 'Platform Core Uptime', value: '99.98%', change: 'Zero fatal incidents', trend: 'up', description: 'www.dstechagency.com & APIs' },
          { id: 's-it-2', label: 'Average API Latency', value: '142ms', change: 'Optimized via Edge Cache', trend: 'up', description: 'Express Server & SQLite/Cloud DB' },
          { id: 's-it-3', label: 'Cloud Infrastructure', value: '18 Nodes', change: 'Autoscaling enabled', trend: 'neutral', description: 'AWS/GCP Container Clusters' },
          { id: 's-it-4', label: 'Resolved IT Tickets', value: '142 / 146', change: '97.2% first-contact fix', trend: 'up', description: 'Staff & Faculty IT Helpdesk' }
        ];

        tasks = [
          { id: 't-it-1', title: 'Rotate Database Access Secrets & Audit S3 Storage Bucket ACLs', priority: 'High', status: 'Completed', dueDate: '2026-10-05', assignee: 'Engr. Faruq Mohammed', department: 'Information Technology', departmentCode: 'ITD' },
          { id: 't-it-2', title: 'Deploy Enhanced PWA Service Worker Cache Version 2.4', priority: 'High', status: 'In Progress', dueDate: '2026-10-08', assignee: 'DevOps Lead', department: 'Information Technology', departmentCode: 'ITD' },
          { id: 't-it-3', title: 'Conduct Bi-Weekly Automated Vulnerability Scan on Public APIs', priority: 'Medium', status: 'Pending', dueDate: '2026-10-12', assignee: 'Security Engineer', department: 'Information Technology', departmentCode: 'ITD' }
        ];

        reports = [
          { id: 'rep-it-1', title: 'Monthly Enterprise Platform Reliability & Security Audit', period: 'September 2026', submittedBy: 'Engr. Faruq Mohammed', department: 'Information Technology', departmentCode: 'ITD', status: 'Approved', date: '2026-10-01', summary: 'System availability, DDoS mitigation events, and container performance benchmarks.' }
        ];

        documents = [
          { id: 'doc-it-1', title: 'Information Security & Cloud Infrastructure Architecture', category: 'Technical', department: 'IT', departmentCode: 'ITD', lastUpdated: '2026-08-30', size: '4.5 MB', status: 'Active', referenceNo: 'DST/IT/ARCH-01', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-it-1', action: 'Applied Security Patch to Production Server', user: 'Engr. Faruq Mohammed', role: 'HOD IT', department: 'Information Technology', timestamp: '1 hour ago', status: 'Deployed', category: 'tech', details: 'Hardened cryptographic session validation and token revocation.' }
        ];

        departmentInfo = {
          name: 'Information Technology',
          head: 'Engr. Faruq Mohammed',
          code: 'ITD',
          staffCount: 9,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 6,
          operationalStatus: 'Systems Resilient',
          description: 'Maintains enterprise servers, cloud databases, cybersecurity perimeters, web portal availability, CI/CD pipelines, and internal IT workstation connectivity.',
          coreMandates: [
            'Ensuring continuous 99.9%+ availability for public web and internal portal systems',
            'Enforcing rigorous cybersecurity, zero-trust firewalls, and regular vulnerability audits',
            'Automating code deployments and maintaining developer staging test environments',
            'Providing swift IT technical assistance to staff, students, and faculty'
          ],
          teamMembers: [
            { name: 'Engr. Faruq Mohammed', role: 'Head of Department, Information Technology', email: 'dstechitoffice@gmail.com', status: 'Active' },
            { name: 'Tunde Adebayo', role: 'Senior Cloud DevOps Engineer', email: 'tunde.it@dstechagency.com', status: 'Active' },
            { name: 'Halima Sadiq', role: 'Information Security & Compliance Analyst', email: 'halima.it@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'AIC') {
        stats = [
          { id: 's-aic-1', label: 'Proprietary AI Models', value: '4 Agents', change: 'Gemini 3.7 Integrated', trend: 'up', description: 'Tutor, Screener, Copilot, Admin' },
          { id: 's-aic-2', label: 'Monthly Prompt Queries', value: '320,000+', change: '+38% interaction rate', trend: 'up', description: 'Student Code Review & Guidance' },
          { id: 's-aic-3', label: 'Agent Response Latency', value: '0.8s Avg', change: 'Server-Sent Events streaming', trend: 'up', description: 'Real-time instructional assistant' },
          { id: 's-aic-4', label: 'Innovation R&D Sprints', value: '8 Sprints', change: 'On schedule', trend: 'neutral', description: 'Multimodal AI & Speech Tools' }
        ];

        tasks = [
          { id: 't-aic-1', title: 'Refine Context-Grounding Prompts for DS Tech Academic Curriculum', priority: 'High', status: 'Completed', dueDate: '2026-10-04', assignee: 'Dr. Chioma Nnamdi', department: 'AI and Creative Technology', departmentCode: 'AIC' },
          { id: 't-aic-2', title: 'Benchmark Gemini 3.7 Flash vs Gemini 3.1 Flash-Lite Token Efficiencies', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'AI Research Lead', department: 'AI and Creative Technology', departmentCode: 'AIC' },
          { id: 't-aic-3', title: 'Develop Code Explainer Module for Junior Programming Cohort', priority: 'Medium', status: 'Pending', dueDate: '2026-10-14', assignee: 'ML Engineer', department: 'AI and Creative Technology', departmentCode: 'AIC' }
        ];

        reports = [
          { id: 'rep-aic-1', title: 'AI Assistant Performance & Automated Tutoring Analytics', period: 'Q3 2026', submittedBy: 'Dr. Chioma Nnamdi', department: 'AI and Creative Technology', departmentCode: 'AIC', status: 'Approved', date: '2026-10-02', summary: 'Student learning trajectory enhancement using Gemini-powered conversational agents.' }
        ];

        documents = [
          { id: 'doc-aic-1', title: 'Responsible AI Deployment & Data Privacy Framework', category: 'Research', department: 'AI & Creative Tech', departmentCode: 'AIC', lastUpdated: '2026-09-05', size: '2.8 MB', status: 'Active', referenceNo: 'DST/AIC/ETHICS-01', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-aic-1', action: 'Enhanced Multilingual System Prompts', user: 'Dr. Chioma Nnamdi', role: 'HOD AI Tech', department: 'AI and Creative Technology', timestamp: '2 hours ago', status: 'Verified', category: 'tech', details: 'Added localized technical guidance across English, Hausa, Yoruba, and French.' }
        ];

        departmentInfo = {
          name: 'AI and Creative Technology',
          head: 'Dr. Chioma Nnamdi',
          code: 'AIC',
          staffCount: 7,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 5,
          operationalStatus: 'Active Innovation',
          description: 'Pioneers proprietary artificial intelligence solutions, agentic workflows, conversational academic tutors, multimodal systems, and advanced generative technology integrations for DS Tech.',
          coreMandates: [
            'Building and maintaining enterprise-grade AI assistants powered by Google Gemini models',
            'Integrating intelligent tutoring tools into the DS Tech Academy learning management experience',
            'Researching emerging deep learning architectures and creative automation pipelines',
            'Ensuring ethical AI compliance, safety guardrails, and student data confidentiality'
          ],
          teamMembers: [
            { name: 'Dr. Chioma Nnamdi', role: 'Head of Department, AI & Creative Tech', email: 'dstechaitechoffice@gmail.com', status: 'Active' },
            { name: 'Ifeanyi Okoro', role: 'Senior AI / NLP Engineer', email: 'ifeanyi.aic@dstechagency.com', status: 'Active' },
            { name: 'Maryam Bello', role: 'Creative Technologist & Prompt Architect', email: 'maryam.aic@dstechagency.com', status: 'Active' }
          ]
        };
      } else if (deptCode === 'LGC') {
        stats = [
          { id: 's-lgc-1', label: 'Active Commercial NDAs', value: '86 Signed', change: '100% digitally verified', trend: 'up', description: 'Enterprise clients, partners, staff' },
          { id: 's-lgc-2', label: 'CAC Regulatory Standing', value: 'Incorporated & Active', change: 'RC-1849204', trend: 'neutral', description: 'Fully compliant with CAMA 2020' },
          { id: 's-lgc-3', label: 'Data Privacy Compliance', value: 'NDPR Certified', change: 'Audit cleared', trend: 'up', description: 'Nigerian Data Protection Regulation' },
          { id: 's-lgc-4', label: 'Contract Review SLA', value: '48 Hours', change: 'Fast legal clearance', trend: 'up', description: 'Service Agreements & Tenders' }
        ];

        tasks = [
          { id: 't-lgc-1', title: 'Verify Corporate Affairs Commission (CAC) Annual Filing Documentation', priority: 'High', status: 'Completed', dueDate: '2026-10-03', assignee: 'Barr. Kalu Samuel', department: 'Legal and Compliance', departmentCode: 'LGC' },
          { id: 't-lgc-2', title: 'Draft Master Services Retainer for Federal Agency Tech Proposal', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-10', assignee: 'Barr. Kalu Samuel', department: 'Legal and Compliance', departmentCode: 'LGC' },
          { id: 't-lgc-3', title: 'Audit Student Data Privacy Protections Under NDPR Guidelines', priority: 'Medium', status: 'Pending', dueDate: '2026-10-16', assignee: 'Compliance Associate', department: 'Legal and Compliance', departmentCode: 'LGC' }
        ];

        reports = [
          { id: 'rep-lgc-1', title: 'Annual Corporate Governance & Statutory Compliance Audit', period: '2026 Statutory', submittedBy: 'Barr. Kalu Samuel', department: 'Legal and Compliance', departmentCode: 'LGC', status: 'Approved', date: '2026-09-25', summary: 'Validation of CAC RC-1849204 registration, TIN standing, and SCUML compliance.' }
        ];

        documents = [
          { id: 'doc-lgc-1', title: 'CAC Official Certificate of Incorporation (RC-1849204)', category: 'Statutory', department: 'Legal', departmentCode: 'LGC', lastUpdated: '2026-06-15', size: '2.4 MB', status: 'Active', referenceNo: 'CAC/RC-1849204', accessTier: 'Departmental' },
          { id: 'doc-lgc-2', title: 'Standard DS Tech Client Non-Disclosure Agreement (NDA)', category: 'Contracts', department: 'Legal', departmentCode: 'LGC', lastUpdated: '2026-08-01', size: '540 KB', status: 'Active', referenceNo: 'DST/LGC/NDA-V3', accessTier: 'Departmental' }
        ];

        recentActivities = [
          { id: 'act-lgc-1', action: 'Executed Client Service Agreement', user: 'Barr. Kalu Samuel', role: 'HOD Legal', department: 'Legal and Compliance', timestamp: '4 hours ago', status: 'Executed', category: 'compliance', details: 'Finalized enterprise software development retainer agreement.' }
        ];

        departmentInfo = {
          name: 'Legal and Compliance',
          head: 'Barr. Kalu Samuel',
          code: 'LGC',
          staffCount: 5,
          budgetYear: 'FY 2026 / 2027',
          activeProjects: 4,
          operationalStatus: 'Compliant & Certified',
          description: 'Safeguards corporate legal standing, enforces regulatory compliance with Corporate Affairs Commission (CAC RC-1849204), drafts client agreements, and governs intellectual property protection.',
          coreMandates: [
            'Maintaining full regulatory compliance with CAC, SCUML, FIRS, and the Federal Republic of Nigeria',
            'Drafting and negotiating enterprise MSAs, SLAs, NDAs, and employment covenants',
            'Protecting corporate intellectual property, trademarks, software copyrights, and patent filings',
            'Governing NDPR data privacy compliance and student credential verification standards'
          ],
          teamMembers: [
            { name: 'Barr. Kalu Samuel', role: 'Head of Department, Legal & Compliance', email: 'dstechlegaloffice@gmail.com', status: 'Active' },
            { name: 'Barr. Zainab Mustapha', role: 'Regulatory & Corporate Affairs Counsel', email: 'zainab.lgc@dstechagency.com', status: 'Active' },
            { name: 'Chinedu Obi', role: 'Contracts & Intellectual Property Officer', email: 'chinedu.lgc@dstechagency.com', status: 'Active' }
          ]
        };
      }
    }

    const payload = {
      role: session.role,
      user: {
        role: session.role,
        roleTitle: session.roleTitle,
        department: session.department,
        departmentCode: session.departmentCode,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        phone: session.phone,
        officeLocation: session.officeLocation,
        bio: session.bio,
        joinedDate: session.joinedDate,
        permissions: session.permissions
      },
      stats,
      departmentInfo,
      recentActivities,
      tasks,
      reports,
      documents,
      announcements,
      notifications: [
        { id: 'n-1', title: 'System Security Audit Passed', message: 'Cryptographic session tokens and authentication gateways operating normally.', timestamp: '10 mins ago', unread: true, type: 'system' as const },
        { id: 'n-2', title: 'Upcoming Management Briefing', message: 'Executive briefing scheduled for Thursday at 10:00 AM in the Executive Boardroom.', timestamp: '1 hour ago', unread: true, type: 'meeting' as const },
        { id: 'n-3', title: 'Q4 Budget Clearance', message: 'Q4 capital disbursements verified by Accounting and Finance Directorate.', timestamp: '3 hours ago', unread: false, type: 'report' as const }
      ],
      meetings,
      departmentPerformance,
      executiveOverview: isCeo ? {
        totalDepartments: 9,
        totalStaff: 68,
        pendingExecutiveReports: 4,
        scheduledBoardMeetings: 3,
        averageKpiScore: 94.8,
        annualRunRate: '₦142,500,000'
      } : undefined
    };

    return res.json({ success: true, data: payload });
  });

  // 5. Update / Add Task Endpoint
  app.post('/api/management/tasks', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session invalid.' });
    }

    const { id, title, priority, status, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const taskId = id || `task_${Date.now()}`;
    const newTask = {
      id: taskId,
      title,
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee: session.name,
      department: session.department,
      departmentCode: session.departmentCode
    };

    managementTasksStore.set(taskId, newTask);
    return res.json({ success: true, task: newTask });
  });

  // 6. Submit Report Endpoint
  app.post('/api/management/reports', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session invalid.' });
    }

    const { id, title, period, summary } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ success: false, error: 'Report title and summary are required.' });
    }

    const repId = id || `rep_${Date.now()}`;
    const newReport = {
      id: repId,
      title,
      period: period || 'Current Period',
      submittedBy: session.name,
      department: session.department,
      departmentCode: session.departmentCode,
      status: session.role === 'CEO' ? 'Approved' : 'Submitted',
      date: new Date().toISOString().split('T')[0],
      summary
    };

    managementReportsStore.set(repId, newReport);
    return res.json({ success: true, report: newReport });
  });

  // 7. Publish Announcement Endpoint
  app.post('/api/management/announcements', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session invalid.' });
    }

    const { title, content, priority, targetAudience } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const annId = `ann_${Date.now()}`;
    const newAnn = {
      id: annId,
      title,
      author: session.name,
      authorRole: session.roleTitle,
      date: new Date().toISOString().split('T')[0],
      priority: priority || 'Normal',
      content,
      targetAudience: targetAudience || 'All Staff'
    };

    managementAnnouncementsStore.set(annId, newAnn);
    return res.json({ success: true, announcement: newAnn });
  });

  // 8. Update Profile Settings Endpoint
  app.patch('/api/management/profile', (req, res) => {
    const session = getManagementSession(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session invalid.' });
    }

    const { phone, officeLocation, bio } = req.body;
    if (phone) session.phone = phone;
    if (officeLocation) session.officeLocation = officeLocation;
    if (bio) session.bio = bio;

    // Update account record too
    const acc = managementAccountsStore.get(session.email);
    if (acc) {
      if (phone) acc.phone = phone;
      if (officeLocation) acc.officeLocation = officeLocation;
      if (bio) acc.bio = bio;
    }

    return res.json({
      success: true,
      user: {
        role: session.role,
        roleTitle: session.roleTitle,
        department: session.department,
        departmentCode: session.departmentCode,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        phone: session.phone,
        officeLocation: session.officeLocation,
        bio: session.bio,
        joinedDate: session.joinedDate,
        permissions: session.permissions
      }
    });
  });

  // Admin Auth Gate Fallback Endpoint (for Admin Dashboard)
  app.post('/api/auth/login', (req, res) => {
    try {
      const { password } = req.body;
      // Allow authorized administrative credentials
      if (password === 'dstech%)' || password === 'dstechadmin2026' || password === 'admin') {
        return res.json({
          success: true,
          email: 'admin@dstechagency.com',
          fullName: 'DS Tech Platform Administrator',
          role: 'Admin'
        });
      }
      return res.status(401).json({ success: false, error: 'Incorrect admin secret key.' });
    } catch {
      return res.status(500).json({ success: false, error: 'Authentication failed.' });
    }
  });

  // Always use Vite middleware to support both React client and serverless /api routes in the local server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
