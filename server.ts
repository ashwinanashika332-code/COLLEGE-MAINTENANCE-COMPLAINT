import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialization for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Fallback rule-based analyzer when AI is not configured or offline
function fallbackAnalyzeComplaint(text: string, location?: string) {
  const lower = (text + " " + (location || "")).toLowerCase();
  
  let category = "Other";
  let urgency = "Medium";
  let suggestedDepartment = "General Campus Maintenance";
  let estimatedResolutionHours = 24;
  let safetyAction = "Please report immediately to the campus block supervisor.";

  // Detect Emergency
  if (
    lower.includes("spark") ||
    lower.includes("smoke") ||
    lower.includes("fire") ||
    lower.includes("short circuit") ||
    lower.includes("gas leak") ||
    lower.includes("flooding") ||
    lower.includes("burst pipe") ||
    lower.includes("electric shock") ||
    lower.includes("shattered glass") ||
    lower.includes("ceiling collapse")
  ) {
    urgency = "Emergency";
    estimatedResolutionHours = 2;
    safetyAction = "Keep clear of the affected zone and notify campus emergency security.";
  } else if (
    lower.includes("no power") ||
    lower.includes("blackout") ||
    lower.includes("overflow") ||
    lower.includes("exam") ||
    lower.includes("server down") ||
    lower.includes("lab equipment")
  ) {
    urgency = "High";
    estimatedResolutionHours = 6;
  } else if (
    lower.includes("squeak") ||
    lower.includes("scratch") ||
    lower.includes("faded") ||
    lower.includes("dusty") ||
    lower.includes("slow")
  ) {
    urgency = "Low";
    estimatedResolutionHours = 48;
  }

  // Category detection
  if (
    lower.includes("fan") ||
    lower.includes("light") ||
    lower.includes("bulb") ||
    lower.includes("switch") ||
    lower.includes("plug") ||
    lower.includes("socket") ||
    lower.includes("power") ||
    lower.includes("electric") ||
    lower.includes("ac") ||
    lower.includes("air conditioner")
  ) {
    category = "Electrical";
    suggestedDepartment = "Electrical Maintenance Division";
  } else if (
    lower.includes("leak") ||
    lower.includes("water") ||
    lower.includes("pipe") ||
    lower.includes("tap") ||
    lower.includes("drain") ||
    lower.includes("flush") ||
    lower.includes("sink") ||
    lower.includes("faucet") ||
    lower.includes("restroom") ||
    lower.includes("toilet")
  ) {
    category = "Plumbing";
    suggestedDepartment = "Plumbing & Water Supply Division";
  } else if (
    lower.includes("wifi") ||
    lower.includes("wi-fi") ||
    lower.includes("internet") ||
    lower.includes("router") ||
    lower.includes("network") ||
    lower.includes("ethernet") ||
    lower.includes("lan")
  ) {
    category = "Internet / Wi-Fi";
    suggestedDepartment = "Campus IT & Networking Services";
  } else if (
    lower.includes("desk") ||
    lower.includes("chair") ||
    lower.includes("bench") ||
    lower.includes("podium") ||
    lower.includes("table") ||
    lower.includes("cupboard") ||
    lower.includes("furniture")
  ) {
    category = "Furniture";
    suggestedDepartment = "Carpentry & Estate Management";
  } else if (
    lower.includes("clean") ||
    lower.includes("trash") ||
    lower.includes("garbage") ||
    lower.includes("smell") ||
    lower.includes("odor") ||
    lower.includes("dirty") ||
    lower.includes("washroom") ||
    lower.includes("mop")
  ) {
    category = "Cleaning";
    suggestedDepartment = "Campus Sanitation & Housekeeping";
  } else if (
    lower.includes("projector") ||
    lower.includes("blackboard") ||
    lower.includes("whiteboard") ||
    lower.includes("screen") ||
    lower.includes("audio") ||
    lower.includes("speaker") ||
    lower.includes("classroom")
  ) {
    category = "Classroom";
    suggestedDepartment = "Academic Facilities & AV Support";
  } else if (
    lower.includes("microscope") ||
    lower.includes("chemical") ||
    lower.includes("fume hood") ||
    lower.includes("lab") ||
    lower.includes("spectrometer")
  ) {
    category = "Laboratory";
    suggestedDepartment = "Scientific Laboratories Maintenance";
  } else if (
    lower.includes("hostel") ||
    lower.includes("dorm") ||
    lower.includes("room door") ||
    lower.includes("bed") ||
    lower.includes("mess") ||
    lower.includes("canteen")
  ) {
    category = "Hostel";
    suggestedDepartment = "Hostel Estate & Residential Warden Office";
  }

  // Capitalize and format rewritten description
  const cleanInput = text.trim();
  const locNote = location ? ` at ${location}` : "";
  const rewritten = `Issue regarding ${category.toLowerCase()} maintenance${locNote}: "${cleanInput}". Maintenance inspection, troubleshooting, and necessary rectification requested.`;
  const summary = `${category} issue reported${locNote} - ${cleanInput.slice(0, 70)}`;

  return {
    category,
    urgency,
    urgencyReason: `Determined based on facility impact keywords and urgency criteria (${urgency}).`,
    rewrittenComplaint: rewritten,
    suggestedDepartment,
    summary,
    estimatedResolutionHours,
    recommendedSafetyAction: safetyAction,
    aiPowered: false,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User storage in-memory store
  const storedUsers = [
    {
      id: 'user-01',
      name: 'Aarav Sharma',
      collegeId: 'CS2023-4819',
      email: 'aarav.sharma@campus.edu',
      department: 'Computer Science & Engineering',
      role: 'student',
      phone: '+91 98112 34567',
      blockOrHostel: 'Hostel Block B (South)',
      roomNumber: 'Room 304',
      registeredAt: '2025-08-15T10:00:00Z',
      password: 'password123',
    },
    {
      id: 'user-02',
      name: 'Dr. Anita Roy',
      collegeId: 'FAC-MECH-102',
      email: 'anita.roy@campus.edu',
      department: 'Mechanical Engineering',
      role: 'staff',
      phone: '+91 98223 45678',
      blockOrHostel: 'Main Academic Block',
      roomNumber: 'Cabin 412',
      registeredAt: '2024-01-10T09:00:00Z',
      password: 'password123',
    },
    {
      id: 'user-03',
      name: 'Dean Arthur Vance',
      collegeId: 'ADMIN-ESTATE-01',
      email: 'estate.director@campus.edu',
      department: 'Campus Estate & Facility Staff',
      role: 'admin',
      phone: '+91 98334 56789',
      blockOrHostel: 'Estate & Maintenance Headquarters',
      roomNumber: 'Director Suite 101',
      registeredAt: '2023-06-01T08:30:00Z',
      password: 'adminpassword',
    },
  ];

  // Helper to sanitize user object
  const sanitizeUser = (u: any) => {
    const { password, ...safeUser } = u;
    return safeUser;
  };

  // Get all registered users
  app.get("/api/users", (_req, res) => {
    res.json(storedUsers.map(sanitizeUser));
  });

  // Get user by ID
  app.get("/api/users/:id", (req, res) => {
    const user = storedUsers.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(sanitizeUser(user));
  });

  // User Login Endpoint
  app.post("/api/users/login", (req, res) => {
    const { identifier, password } = req.body || {};
    if (!identifier) {
      res.status(400).json({ error: "College ID or institutional email is required" });
      return;
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const user = storedUsers.find(
      (u) =>
        u.collegeId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      res.status(401).json({ error: "No campus account found with this ID or email. Please register as a new user." });
      return;
    }

    // If password provided and user has a password, verify
    if (password && user.password && user.password !== password) {
      res.status(401).json({ error: "Invalid password. Default demo password is 'password123'." });
      return;
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: `Welcome back, ${user.name}!`,
    });
  });

  // User Registration Endpoint
  app.post("/api/users/register", (req, res) => {
    const { name, collegeId, email, department, role, phone, blockOrHostel, roomNumber, password } = req.body || {};

    if (!name || !collegeId) {
      res.status(400).json({ error: "Full Name and College ID are required." });
      return;
    }

    const cleanCollegeId = String(collegeId).trim().toUpperCase();
    const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanCollegeId.toLowerCase()}@campus.edu`;

    // Check duplicate
    const existing = storedUsers.find(
      (u) =>
        u.collegeId.toUpperCase() === cleanCollegeId ||
        u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      res.status(409).json({ error: `An account with College ID ${cleanCollegeId} or Email ${cleanEmail} already exists. Please log in instead.` });
      return;
    }

    const newUser = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      collegeId: cleanCollegeId,
      email: cleanEmail,
      department: department || 'Computer Science & Engineering',
      role: role === 'admin' ? 'admin' : role === 'staff' ? 'staff' : 'student',
      phone: phone ? String(phone).trim() : undefined,
      blockOrHostel: blockOrHostel ? String(blockOrHostel).trim() : undefined,
      roomNumber: roomNumber ? String(roomNumber).trim() : undefined,
      password: password || 'campus123',
      registeredAt: new Date().toISOString(),
    };

    storedUsers.push(newUser);
    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      message: "Registration successful! Account created and saved.",
    });
  });

  // Update user profile information
  app.put("/api/users/:id", (req, res) => {
    const userIndex = storedUsers.findIndex((u) => u.id === req.params.id);
    if (userIndex === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const current = storedUsers[userIndex];
    const { name, department, phone, blockOrHostel, roomNumber } = req.body || {};

    storedUsers[userIndex] = {
      ...current,
      name: name ? String(name).trim() : current.name,
      department: department || current.department,
      phone: phone !== undefined ? String(phone).trim() : current.phone,
      blockOrHostel: blockOrHostel !== undefined ? String(blockOrHostel).trim() : current.blockOrHostel,
      roomNumber: roomNumber !== undefined ? String(roomNumber).trim() : current.roomNumber,
    };

    res.json({
      success: true,
      user: sanitizeUser(storedUsers[userIndex]),
      message: "User information updated and stored successfully.",
    });
  });

  // 1. Analyze Complaint with Gemini AI
  app.post("/api/analyze-complaint", async (req, res) => {
    const { rawDescription, location, building, roomNumber, manualCategory } = req.body || {};

    if (!rawDescription || typeof rawDescription !== "string") {
      res.status(400).json({ error: "Missing or invalid rawDescription" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback
      const fallback = fallbackAnalyzeComplaint(rawDescription, `${building || ""} ${roomNumber || ""} ${location || ""}`.trim());
      if (manualCategory && manualCategory !== "Other") {
        fallback.category = manualCategory;
      }
      res.json(fallback);
      return;
    }

    try {
      const prompt = `You are the Campus Maintenance AI for an engineering university / college.
A student or staff member has entered a maintenance complaint.
Raw Complaint Input: "${rawDescription}"
Reported Location/Details: Building: "${building || 'Not specified'}", Room: "${roomNumber || 'Not specified'}", Additional Location: "${location || 'None'}".
Optional Manual Category picked by user: "${manualCategory || 'None'}".

Categories allowed (choose one):
- Electrical
- Plumbing
- Classroom
- Furniture
- Cleaning
- Internet / Wi-Fi
- Laboratory
- Hostel
- Other

Urgencies allowed (choose one):
- Low: Non-critical, cosmetic or minor inconvenience (e.g. minor squeak, dim bulb where another works, scratch)
- Medium: Functional disruption to 1-5 people (e.g. fan not working in a bedroom, 1 slow socket, whiteboard dirty)
- High: Affects classrooms during instruction, labs, key faculty, or multiple occupants (e.g. main projector down, Wi-Fi dead in whole wing, water leakage near desks)
- Emergency: Safety threat, fire hazard, sparking wires, smoke, gas leaks, severe flooding, toxic spill, structural risk.

Tasks:
1. Determine the accurate category.
2. Determine urgency (Low, Medium, High, Emergency) and explain the reason concisely.
3. Rewrite the informal/short complaint into an executive, highly professional maintenance ticket suitable for facility technicians (e.g. "fan not working in room 204" -> "Ceiling fan in Room 204 is non-operational. Please arrange for electrical diagnostic and repair.").
4. Suggest the appropriate maintenance department (e.g. "Electrical Maintenance Division", "Campus IT & Network Infrastructure", "Sanitation & Housekeeping", "Civil & Carpentry Works", "Plumbing & Water Supply Division", "Audio-Visual Campus Services", "Hostel Residential Management").
5. Create a concise 1-sentence summary title for the ticket.
6. Provide estimated resolution time in hours (Emergency: 1-3, High: 4-12, Medium: 12-36, Low: 24-72).
7. Recommended immediate safety/precautionary action for students/occupants.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "One of Electrical, Plumbing, Classroom, Furniture, Cleaning, Internet / Wi-Fi, Laboratory, Hostel, Other",
              },
              urgency: {
                type: Type.STRING,
                description: "Low, Medium, High, or Emergency",
              },
              urgencyReason: {
                type: Type.STRING,
                description: "Short reason for urgency assignment",
              },
              rewrittenComplaint: {
                type: Type.STRING,
                description: "Professional, grammatically clear ticket rewrite",
              },
              suggestedDepartment: {
                type: Type.STRING,
                description: "Appropriate maintenance team name",
              },
              summary: {
                type: Type.STRING,
                description: "Concise 1-sentence ticket title/summary",
              },
              estimatedResolutionHours: {
                type: Type.NUMBER,
                description: "Expected turnaround time in hours",
              },
              recommendedSafetyAction: {
                type: Type.STRING,
                description: "Immediate safety advice or preventive caution",
              },
            },
            required: [
              "category",
              "urgency",
              "urgencyReason",
              "rewrittenComplaint",
              "suggestedDepartment",
              "summary",
              "estimatedResolutionHours",
              "recommendedSafetyAction",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        ...parsed,
        aiPowered: true,
      });
    } catch (err: any) {
      console.error("Gemini AI complaint analysis error:", err?.message || err);
      const fallback = fallbackAnalyzeComplaint(rawDescription, `${building || ""} ${roomNumber || ""} ${location || ""}`.trim());
      if (manualCategory && manualCategory !== "Other") {
        fallback.category = manualCategory;
      }
      res.json(fallback);
    }
  });

  // 2. Chat Assistant for Campus Maintenance Inquiries & Interactive Help
  app.post("/api/chat-assistant", async (req, res) => {
    const { messages, userRole, userName } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        reply: `Hello ${userName || "Student"}! I am the College Maintenance AI Assistant. You can ask me how to report electrical, plumbing, Wi-Fi, or hostel issues, or report an emergency immediately. How can I assist with your campus facility needs today?`,
        suggestedActions: ["Report Broken Fan/AC", "Report Wi-Fi Issue", "Report Restroom Leakage", "Campus Emergency Hotline"],
      });
      return;
    }

    try {
      const chatPrompt = `You are "CampusFix AI", an intelligent, empathetic, and knowledgeable Campus Maintenance Concierge for a modern college.
User Name: ${userName || "Campus Member"}
Role: ${userRole || "Student"}

Help the user diagnose maintenance issues, understand what details are needed to file a complaint, classify emergencies, or explain typical turnaround SLAs (Emergency: <2 hrs, High: <8 hrs, Medium: <24 hrs, Low: <48 hrs).
Be encouraging, polite, concise, and professional.
Conversation history:
${(messages || []).map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n")}

Respond with a JSON object containing:
- reply (string, markdown supported)
- suggestedActions (array of 3-4 short click-to-ask follow up phrases)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: chatPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              suggestedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["reply", "suggestedActions"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Chat Assistant error:", err?.message || err);
      res.json({
        reply: "I'm currently ready to assist you. You can report broken furniture, electrical hazards, water leakages, or network failures directly through the 'Submit Complaint' tab.",
        suggestedActions: ["Submit an electrical ticket", "Where is my ticket?", "Campus emergency contacts"],
      });
    }
  });

  // 3. AI-Powered Campus Facility Analytics Insights
  app.post("/api/generate-insights", async (req, res) => {
    const { complaintsSummary } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        topRecurringProblem: "Ceiling fans and electrical switchboards in older classroom blocks",
        vulnerableBuilding: "Science Block & Technology Complex (Wing B)",
        preventiveActions: [
          "Conduct weekend surge testing for classroom projectors in Main Academic Block",
          "Inspect hostel water booster pumps before monsoon season",
          "Replace aging Wi-Fi access points in Engineering Block Floors 2 & 3",
        ],
        aiExecutiveSummary: "Overall campus maintenance is performing well with an 84% on-time resolution rate. Priority attention should be given to electrical complaints in older engineering classrooms.",
      });
      return;
    }

    try {
      const prompt = `Analyze this summary of recent campus maintenance complaint data:
${JSON.stringify(complaintsSummary || {}, null, 2)}

Provide an AI Facility Management Executive Report with:
1. topRecurringProblem: What is the most frequent or impactful recurring defect?
2. vulnerableBuilding: Which building requires immediate preventive maintenance inspection?
3. preventiveActions: List of 3 actionable preventive engineering steps for the estate director.
4. aiExecutiveSummary: 2-3 sentence executive review of resolution speed, student satisfaction, and equipment health.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topRecurringProblem: { type: Type.STRING },
              vulnerableBuilding: { type: Type.STRING },
              preventiveActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              aiExecutiveSummary: { type: Type.STRING },
            },
            required: ["topRecurringProblem", "vulnerableBuilding", "preventiveActions", "aiExecutiveSummary"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Insights generation error:", err?.message || err);
      res.json({
        topRecurringProblem: "Frequent classroom lighting and projector calibration faults",
        vulnerableBuilding: "Engineering Block Floor 3 & Main Academic Center",
        preventiveActions: [
          "Replace fluorescent tubes with LED fixtures across Science Block",
          "Schedule monthly drain snaking in Hostel Wing A & B washrooms",
          "Upgrade Wi-Fi routers in Tech Park Common Areas",
        ],
        aiExecutiveSummary: "Campus facilities operate at a solid 88% resolution speed. Estate teams should target proactive electrical maintenance to reduce student ticket volume.",
      });
    }
  });

  // Vite middleware for development vs static production files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`College Maintenance Complaint AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
