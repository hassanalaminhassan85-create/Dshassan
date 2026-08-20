import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory conversation store for threads
  const conversationsStore = new Map<string, { id: string; title: string; user_role: string; updated_at: string; messages: Array<any> }>();

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
    context += `  - Contact Hotline: +234 813 123 4567 | Support Email: info@dstech.com / support@dstech.com\n`;
    context += `  - Official Website: https://dstech.com\n`;
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
- Always include CAC Registration (RC-1849204), Garki Abuja headquarters location, phone contact (+234 813 123 4567), email (info@dstech.com), core digital agency services, and Academy training offerings.
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
          const contentsPayload: any[] = [{ text: systemInstruction }];

          if (Array.isArray(history) && history.length > 0) {
            history.slice(-10).forEach((msg: any) => {
              if (msg.sender === 'user') {
                contentsPayload.push({ text: `User: ${msg.content}` });
              } else if (msg.sender === 'assistant') {
                contentsPayload.push({ text: `Assistant: ${msg.content}` });
              }
            });
          }

          contentsPayload.push({ text: `User: ${message}` });

          const streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3.7-flash',
            contents: contentsPayload
          });

          for await (const chunk of streamResponse) {
            const chunkText = chunk.text;
            if (chunkText) {
              fullReply += chunkText;
              res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            }
          }
        } catch (streamErr: any) {
          console.warn('Streaming failed or model unavailable, trying non-streaming fallback:', streamErr?.message);
        }
      }

      // If streaming produced no output (or key missing), send fallback response
      if (!fullReply) {
        const lower = message.toLowerCase();
        if (lower.includes('cac') || lower.includes('registration') || lower.includes('rc-1849204')) {
          fullReply = `**DS Tech & Digital Marketing Agency Limited** is fully registered with the Corporate Affairs Commission (CAC), Federal Republic of Nigeria, under registration **RC-1849204** (TIN: 24892019-0001).

Operational status is active and verified for software engineering, IT consulting, and digital marketing services.`;
        } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('tuition') || lower.includes('cost')) {
          fullReply = `Here is the official **DS TECH Academy Pricing Matrix**:

| Duration | Virtual | Physical | Hybrid |
| :--- | :--- | :--- | :--- |
| **1 Month** | ₦50,000 | ₦100,000 | ₦150,000 |
| **3 Months** | ₦100,000 | ₦200,000 | ₦300,000 |
| **6 Months** | ₦200,000 | ₦300,000 | ₦400,000 |

All programmes include certified practical projects and student portal access.`;
        } else {
          fullReply = `Hello! I am **DS TECH AI**, your general-purpose AI assistant. I can help you write code, solve problems, draft proposals, analyze data, or answer questions about DS TECH's services, courses, and pricing. How can I help you today?`;
        }

        // Send fallback chunk
        res.write(`data: ${JSON.stringify({ chunk: fullReply })}\n\n`);
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
        const modelsToTry = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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

            const contentsPayload: any[] = [{ text: systemInstruction }];

            if (Array.isArray(history) && history.length > 0) {
              history.slice(-10).forEach((msg: any) => {
                if (msg.sender === 'user') {
                  contentsPayload.push({ text: `User: ${msg.content}` });
                } else if (msg.sender === 'assistant') {
                  contentsPayload.push({ text: `Assistant: ${msg.content}` });
                }
              });
            }

            contentsPayload.push({ text: `User: ${message}` });

            const response = await ai.models.generateContent({
              model: modelName,
              contents: contentsPayload
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
        const lower = message.toLowerCase();
        if (lower.includes('cac') || lower.includes('registration') || lower.includes('rc-1849204')) {
          reply = `**DS Tech & Digital Marketing Agency Limited** is fully registered with the Corporate Affairs Commission (CAC), Federal Republic of Nigeria, under registration **RC-1849204** (TIN: 24892019-0001).

Operational status is active and verified for software engineering, IT consulting, and digital marketing services.`;
          sources = [{ id: 'src_cac', title: 'CAC Corporate Registry Certificate', category: 'Compliance' }];
        } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('tuition') || lower.includes('cost')) {
          reply = `Here is the official **DS TECH Academy Pricing Matrix**:

| Duration | Virtual | Physical | Hybrid |
| :--- | :--- | :--- | :--- |
| **1 Month** | ₦50,000 | ₦100,000 | ₦150,000 |
| **3 Months** | ₦100,000 | ₦200,000 | ₦300,000 |
| **6 Months** | ₦200,000 | ₦300,000 | ₦400,000 |

All programmes include certified practical projects and student portal access.`;
          sources = [{ id: 'src_pricing', title: 'DS Tech Academy Fixed Pricing Matrix', category: 'Academy' }];
        } else {
          reply = `Hello! I am **DS TECH AI**, your general-purpose AI assistant. I can help you write code, solve complex problems, draft proposals, analyze data, or answer questions regarding DS TECH services and courses. How can I assist you today?`;
          sources = [{ id: 'src_general', title: 'DS Tech Knowledge Hub', category: 'Support' }];
        }
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
