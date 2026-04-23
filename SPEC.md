# Agent Builder Dashboard - Technical Specification

## Project Overview
- **Name:** Agent Builder Dashboard
- **Type:** Commercial SaaS Web Application (MaaS Platform)
- **Core Functionality:** Multi-tenant AI agent generation, containerization, deployment, and monetization platform
- **Target Users:** Consultants demonstrating AI agent builds to clients during live sessions
- **Deployment Target:** Hostinger VPS

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Agent Builder Dashboard                      │
│                         (Next.js + Express)                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend (Express API)  │  Stripe SDK   │
│  - Wizard UI         │  - Agent Scaffolding    │  - Checkout   │
│  - Terminal Visual  │  - Docker Generation    │  - Meter Events│
│  - File Tree        │  - Port Management      │  - Portal      │
│  - Client Preview   │  - Nginx Config Gen     │               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │           Generated Client Agents            │
        │  (Docker Containers with unique subdomains)  │
        └─────────────────────────────────────────────┘
```

---

## Phase 1: Frontend Specification

### 1.1 Needs Assessment Wizard

**Multi-Step Form Structure:**

| Step | Field | Type | Options |
|------|-------|------|---------|
| 1 | Target Industry | Select | Healthcare, Finance, Legal, E-commerce, Marketing, HR, Real Estate, Custom |
| 2 | Operational Field | Select | Customer Service, Data Entry, Analytics, Scheduling, Sales, Support, Research, Custom |
| 3 | Primary Use Cases | Multi-select + Text | [Dynamic based on field] |
| 4 | Tone of Voice | Select | Professional, Friendly, Casual, Technical, Authoritative, Custom |
| 5 | Deployment Interface | Multi-select | Web Widget, Slack Bot, SMS, WhatsApp, API Endpoint, Chrome Extension |

**UI Requirements:**
- Progress bar at top showing current step (1-5)
- Animated transitions between steps (slide + fade)
- Back/Next buttons with keyboard support
- Real-time preview panel showing selections

### 1.2 Over-the-Shoulder Visualizer

**Visual Requirements:**
- Dark theme with accent colors (primary: #6366f1, secondary: #22d3ee)
- Glassmorphism cards with subtle animations
- Value propositions animate in as user makes selections
- Professional, modern aesthetic suitable for client demos

**Key Components:**
- Animated stats counters (e.g., "40% time saved", "3x faster")
- ROI calculator that updates based on selections
- Testimonial/case study snippets relevant to industry

### 1.3 Real-Time Generation Display

**Terminal Component:**
- Monospace font (JetBrains Mono or Fira Code)
- Syntax highlighting for code output
- Scrolling animation with typewriter effect
- Green success indicators, yellow warnings, red errors

**File Tree Visualizer:**
- Hierarchical tree view with expand/collapse
- File icons based on type (.ts, .js, .json, .md, .yml)
- Animated file creation with fade-in
- Color-coded by file type

**Example Output:**
```
agent-builder/
├── src/
│   ├── index.ts          ✓ Created
│   ├── tools/
│   │   ├── api.ts        ✓ Created
│   │   └── database.ts   ✓ Created
│   └── prompts/
│       └── system.md     ✓ Created
├── Dockerfile            ✓ Created
├── docker-compose.yml    ✓ Created
└── .env                  ✓ Created
```

---

## Phase 2: Backend Specification

### 2.1 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wizard/validate` | POST | Validate wizard step data |
| `/api/agent/generate` | POST | Start agent generation process |
| `/api/agent/status/:id` | GET | Get generation status |
| `/api/agent/list` | GET | List all generated agents |
| `/api/agent/deploy/:id` | POST | Deploy agent to Docker |
| `/api/agent/delete/:id` | DELETE | Remove agent |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/portal` | GET | Get Stripe customer portal URL |
| `/api/stripe/usage` | POST | Report usage to Stripe Meter |

### 2.2 Agent Directory Structure

Generated agents follow this template:

```
/opt/agents/
└── {client-slug}/
    ├── src/
    │   ├── index.ts          # Main entry point
    │   ├── config.ts         # Agent configuration
    │   ├── prompts/
    │   │   └── system.md     # System prompt
    │   └── tools/
    │       ├── {tool1}.ts
    │       └── {tool2}.ts
    ├── package.json
    ├── tsconfig.json
    ├── Dockerfile
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
```

### 2.3 Docker Generation

**Dynamic Dockerfile Template:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE {PORT}
CMD ["npm", "start"]
```

**Dynamic docker-compose.yml:**
```yaml
version: '3.8'
services:
  agent-{client-slug}:
    build: .
    ports:
      - "{PORT}:3000"
    environment:
      - NODE_ENV=production
      - AGENT_CONFIG={config-json}
      - STRIPE_API_KEY={stripe-key}
    restart: unless-stopped
```

---

## Phase 3: Stripe Integration

### 3.1 Checkout Flow
1. Client completes wizard → Review screen
2. Click "Proceed to Payment" → Backend creates Stripe Checkout Session
3. Redirect to Stripe hosted checkout
4. Success/Cancel redirect back to dashboard

### 3.2 Environment Configuration
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
STRIPE_METER_EVENT_NAME=agent_usage
```

### 3.3 Metered Billing Logic
- Base monthly fee: $49/mo (hosting)
- Usage tiers:
  - 0-10,000 requests: Included
  - 10,001-50,000: $0.001/request
  - 50,001+: $0.0005/request

---

## Phase 4: Hostinger VPS Deployment

### 4.1 Port Management
- Base port range: 3001-3999
- Each agent gets unique port
- Port allocation tracked in JSON config

### 4.2 Nginx Configuration
Auto-generated per agent:
```nginx
server {
    listen 80;
    server_name {client-slug}.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:{PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Process Management
- PM2 for main dashboard process
- Docker Compose for all agent containers
- Auto-restart on failure
- Log rotation configured

---

## UI/UX Design System

### Color Palette
```css
--primary: #6366f1;       /* Indigo */
--primary-dark: #4f46e5;
--secondary: #22d3ee;     /* Cyan */
--accent: #f472b6;        /* Pink */
--success: #10b981;       /* Emerald */
--warning: #f59e0b;       /* Amber */
--error: #ef4444;         /* Red */
--bg-dark: #0f172a;       /* Slate 900 */
--bg-card: #1e293b;       /* Slate 800 */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
```

### Typography
- **Headings:** Inter (700 weight)
- **Body:** Inter (400, 500 weight)
- **Code/Terminal:** JetBrains Mono

### Animations
- Page transitions: 300ms ease-out
- Card hover: scale(1.02) + shadow
- Terminal typing: 30ms per character
- Progress bar: smooth width transition

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] 5-step wizard form fully functional
- [ ] Terminal UI displays real-time generation output
- [ ] File tree visualizer with animated file creation
- [ ] Agent directory structure generated on disk
- [ ] Dockerfile/docker-compose.yml dynamically created
- [ ] Stripe Checkout session creation
- [ ] Test mode default (no real charges)
- [ ] Port allocation system
- [ ] Nginx config generation script
- [ ] Deployment scripts (PM2 + Docker Compose)

### Nice to Have (Post-MVP)
- [ ] Stripe Customer Portal link
- [ ] Metered usage tracking
- [ ] Custom subdomain routing
- [ ] Agent health monitoring dashboard

---

## File Structure

```
agent-builder-dashboard/
├── SPEC.md
├── README.md
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── wizard/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── agent/
│   │       │   ├── generate.ts
│   │       │   ├── status.ts
│   │       │   └── list.ts
│   │       └── stripe/
│   │           ├── checkout.ts
│   │           └── portal.ts
│   ├── components/
│   │   ├── Wizard/
│   │   │   ├── WizardForm.tsx
│   │   │   ├── Step1Industry.tsx
│   │   │   ├── Step2Field.tsx
│   │   │   ├── Step3UseCases.tsx
│   │   │   ├── Step4Tone.tsx
│   │   │   ├── Step5Deployment.tsx
│   │   │   └── Review.tsx
│   │   ├── Visualizer/
│   │   │   ├── Terminal.tsx
│   │   │   ├── FileTree.tsx
│   │   │   └── ValueProposition.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── lib/
│   │   ├── stripe.ts
│   │   ├── agent-generator.ts
│   │   ├── docker-templates.ts
│   │   ├── port-manager.ts
│   │   └── nginx-generator.ts
│   └── types/
│       └── agent.ts
└── scripts/
    ├── deploy.sh
    ├── nginx-setup.sh
    └── pm2.config.js
```