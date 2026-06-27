import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

const DB_FILE = path.resolve(process.cwd(), 'local_d1.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      applications: [
        {
          id: 'seed-hassan-demo',
          data_json: JSON.stringify({
            id: 'seed-hassan-demo',
            createdAt: new Date().toISOString(),
            status: 'approved',
            personalInfo: {
              fullName: 'David Alao Chibuzor',
              maritalStatus: 'Single',
              gender: 'Male',
              dateOfBirth: '1998-04-12',
              nationality: 'Nigerian',
              stateOfOrigin: 'Anambra',
              lgaTownOfOrigin: 'Onitsha North',
              stateOfResidence: 'FCT Abuja',
              residentialAddress: 'Suite B12, Garki Mall, Area 11 Abuja',
              emailAddress: 'david.alao.chibuzor@example.com',
              phoneNumbers: '+2348032485921',
              passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60',
            },
            guarantorInfo: {
              fullName: 'Dr. Yusuf Ibrahim Garki',
              hometown: 'Kano',
              currentAddress: 'No. 14 Close C, Gwarinpa Estate, Abuja',
              phoneNumber: '+2349098485295',
              relationship: 'Academic Mentor',
            },
            educationalBg: {
              highestQualification: 'Bachelor of Science (First Class)',
              schoolInstitution: 'University of Nigeria, Nsukka',
              fieldOfStudy: 'Computer Science & Web Engineering',
              isStudentOrGraduate: 'graduate',
            },
            experiences: {
              exp1: 'Freelance Frontend Developer - Designed 12 commercial Webflow landing pages (2024-2025)',
              exp2: 'Junior UI/UX Architect at TechHub Abuja (6 months internship)',
              exp3: 'Figma Design Coordinator - Managed asset design layouts for 4 startup apps',
            },
            positionSkills: {
              majorRole: 'Lead Frontend Developer',
              skillRole1: 'React.js, NextJS, TypeScript, Tailwind CSS, Framer Motion',
              skillRole2: 'Figma Prototyping, Wireframing, Vectors, Component Design',
              skillRole3: 'REST APIs, Git Versioning, Node/Express Backend, SQLite',
            },
            specialization: {
              interests: ['Website Design', 'App Development', 'Services'],
              otherDetails: 'Specialize in creating highly micro-animated React components with luxury custom layouts.',
            },
            workMode: {
              monthlySalaryJob: 'hybrid',
              contractFreelanceJob: 'remote',
              availableForAnyOpportunity: true,
            },
            languageProficiency: 'English (Native), French (Conversational/Intermediate)',
            personalStatement: 'Highly driven to contribute modern, responsive, and micro-interactive interfaces for DS Tech to position them as the premier digital marketing agency in West Africa.',
            applicantSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'><path d='M10,35 Q30,10 60,30 T110,20 T140,40' fill='none' stroke='%23000E32' stroke-width='3'/></svg>",
            applicantSignatureType: 'draw',
            declarationDate: '2026-06-23',
          })
        }
      ],
      scan_history: [
        {
          id: 'scan_init_demo',
          user_id: 'anonymous',
          applicant_id: 'seed-hassan-demo',
          applicant_name: 'David Alao Chibuzor',
          scanned_at: new Date(Date.now() - 3600000).toISOString(),
          secure_r2_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&fit=crop&auto=format',
          safety_status: 'safe'
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    return { applications: [], scan_history: [] };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const mockDB = {
  prepare(sql: string) {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    return {
      bind(...params: any[]) {
        return {
          all: async () => {
            const db = readDB();
            if (normalizedSql.includes("FROM scan_history WHERE user_id = ?")) {
              const userId = params[0] || 'anonymous';
              const results = db.scan_history
                .filter((r: any) => r.user_id === userId || r.user_id === 'anonymous')
                .sort((a: any, b: any) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
              return { results };
            }
            if (normalizedSql.includes("FROM scan_history")) {
              return { results: db.scan_history };
            }
            if (normalizedSql.includes("FROM applications")) {
              const results = db.applications;
              return { results };
            }
            return { results: [] };
          },
          first: async () => {
            const db = readDB();
            if (normalizedSql.includes("FROM applications WHERE id = ?")) {
              const id = params[0];
              const record = db.applications.find((r: any) => r.id === id);
              return record || null;
            }
            return null;
          },
          run: async () => {
            const db = readDB();
            if (normalizedSql.includes("INSERT INTO scan_history")) {
              const [id, user_id, applicant_id, applicant_name, scanned_at, secure_r2_url, safety_status] = params;
              db.scan_history.unshift({ id, user_id, applicant_id, applicant_name, scanned_at, secure_r2_url, safety_status });
              writeDB(db);
              return { success: true };
            }
            if (normalizedSql.includes("INSERT INTO applications")) {
              const [id, data_json] = params;
              db.applications.push({ id, data_json });
              writeDB(db);
              return { success: true };
            }
            if (normalizedSql.includes("UPDATE applications")) {
              const [data_json, id] = params;
              const record = db.applications.find((r: any) => r.id === id);
              if (record) {
                record.data_json = data_json;
                writeDB(db);
              }
              return { success: true };
            }
            if (normalizedSql.includes("DELETE FROM applications")) {
              const id = params[0];
              db.applications = db.applications.filter((r: any) => r.id !== id);
              writeDB(db);
              return { success: true };
            }
            return { success: true };
          }
        };
      },
      all: async () => {
        const db = readDB();
        if (normalizedSql.includes("FROM applications")) {
          return { results: db.applications };
        }
        if (normalizedSql.includes("FROM scan_history")) {
          return { results: db.scan_history };
        }
        return { results: [] };
      },
      first: async () => {
        return null;
      },
      run: async () => {
        return { success: true };
      }
    };
  }
};

// Vite Plugin to execute Pages Functions locally
function cloudflarePagesDevPlugin() {
  return {
    name: 'cloudflare-pages-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            // Load and run the exact same compiled Pages Function in local dev!
            const { onRequest } = await server.ssrLoadModule('/functions/api/[[path]].ts');
            
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const url = new URL(req.url, `${protocol}://${host}`);
            
            // Read incoming body
            let body: string | undefined = undefined;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              body = await new Promise((resolve) => {
                let chunks = '';
                req.on('data', (chunk: string) => chunks += chunk);
                req.on('end', () => resolve(chunks));
              });
            }

            const requestHeaders = new Headers();
            for (const [key, val] of Object.entries(req.headers)) {
              if (val) {
                if (Array.isArray(val)) {
                  val.forEach(v => requestHeaders.append(key, v));
                } else {
                  requestHeaders.set(key, val as string);
                }
              }
            }

            const fetchRequest = new Request(url.toString(), {
              method: req.method,
              headers: requestHeaders,
              body: body ? body : undefined,
            });

            // Inject local D1 mock DB and process environment keys
            const env = {
              DB: mockDB,
              GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
              BUCKET: undefined,
              VECTORIZE: undefined,
              AI_QUEUE: undefined
            };

            const context = {
              request: fetchRequest,
              env,
              params: {},
              data: {},
              next: async () => new Response("Not found", { status: 404 })
            };

            const response = await onRequest(context);
            
            res.statusCode = response.status;
            response.headers.forEach((value: string, key: string) => {
              res.setHeader(key, value);
            });
            
            if (response.headers.get("content-type")?.includes("text/event-stream")) {
              const reader = response.body.getReader();
              req.on('close', () => {
                reader.cancel();
              });
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
            } else {
              const responseText = await response.text();
              res.end(responseText);
            }
            return;
          } catch (err: any) {
            console.error('Local Pages Functions Executor Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cloudflarePagesDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
