// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  projects;
  contactMessages;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.projects = /* @__PURE__ */ new Map();
    this.contactMessages = /* @__PURE__ */ new Map();
    this.initializeSampleProjects();
  }
  initializeSampleProjects() {
    const sampleProjects = [
      {
        id: "1",
        title: "Customer Segmentation Analysis",
        description: "Machine learning project analyzing customer behavior patterns using clustering algorithms",
        longDescription: "Comprehensive analysis of customer data using unsupervised learning techniques to identify distinct customer segments. Applied K-means clustering and performed extensive EDA to derive actionable business insights.",
        technologies: ["Python", "Scikit-learn", "Pandas", "Matplotlib", "Seaborn"],
        githubUrl: "https://github.com/trecyo/customer-segmentation",
        liveUrl: null,
        imageUrl: null,
        category: "Machine Learning",
        featured: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "2",
        title: "Sales Performance Dashboard",
        description: "Interactive Power BI dashboard tracking KPIs and sales metrics across multiple regions",
        longDescription: "Built a comprehensive Power BI dashboard for executive leadership to track sales performance, regional trends, and key business metrics. Includes automated data refresh and drill-down capabilities.",
        technologies: ["Power BI", "DAX", "SQL Server", "Excel"],
        githubUrl: null,
        liveUrl: "https://app.powerbi.com/view?r=eyJrIjoiabcd1234",
        imageUrl: null,
        category: "BI Analytics",
        featured: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "3",
        title: "Predictive Maintenance Model",
        description: "Time series forecasting model to predict equipment failures and optimize maintenance schedules",
        longDescription: "Developed a predictive maintenance solution using time series analysis and machine learning to forecast equipment failures. Achieved 85% accuracy in predicting failures 30 days in advance.",
        technologies: ["Python", "TensorFlow", "Prophet", "SQL", "Docker"],
        githubUrl: "https://github.com/trecyo/predictive-maintenance",
        liveUrl: null,
        imageUrl: null,
        category: "Data Science",
        featured: false,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "4",
        title: "Market Basket Analysis",
        description: "Association rule mining to discover purchasing patterns and recommend product bundles",
        longDescription: "Implemented market basket analysis using association rule mining algorithms to identify frequently bought together items. Results were used to optimize product placement and create targeted marketing campaigns.",
        technologies: ["R", "Apriori Algorithm", "ggplot2", "Shiny"],
        githubUrl: "https://github.com/trecyo/market-basket-analysis",
        liveUrl: "https://trecyo.shinyapps.io/market-basket/",
        imageUrl: null,
        category: "Data Science",
        featured: false,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    sampleProjects.forEach((project) => {
      this.projects.set(project.id, project);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Contact message methods
  async createContactMessage(insertMessage) {
    const id = randomUUID();
    const message = {
      ...insertMessage,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contactMessages.set(id, message);
    return message;
  }
  // Project methods
  async getProjects() {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getProject(id) {
    return this.projects.get(id);
  }
  async createProject(insertProject) {
    const id = randomUUID();
    const project = {
      ...insertProject,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.projects.set(id, project);
    return project;
  }
  async updateProject(id, updateData) {
    const existingProject = this.projects.get(id);
    if (!existingProject) return void 0;
    const updatedProject = { ...existingProject, ...updateData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  async deleteProject(id) {
    return this.projects.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  technologies: text("technologies").array().notNull(),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  // e.g., "Data Science", "BI Analytics", "Machine Learning"
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true
});
var insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  longDescription: true,
  technologies: true,
  githubUrl: true,
  liveUrl: true,
  imageUrl: true,
  category: true,
  featured: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
        id: message.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Please fill in all required fields correctly.",
          errors: error.errors
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({
          success: false,
          message: "There was an error sending your message. Please try again."
        });
      }
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects"
      });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch project"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
