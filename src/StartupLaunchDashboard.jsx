import { useState, useEffect, useRef } from "react";

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   THEME DEFAULTS (source of truth for CSS vars)
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const THEME_DEFAULTS = {
  // Core brand â refined teal-green, confident but not loud
  "--color-primary":       "#0D9488",
  "--color-primary-light":  "#2DD4BF",
  "--color-primary-dark":   "#0F766E",
  "--color-accent":         "#134E4A",
  "--color-soft":           "#F0FDFA",
  "--color-soft-border":    "#99F6E4",
  // Layout â warm white, not blue-gray
  "--color-bg":             "#FAFAF9",
  "--color-surface":        "#FFFFFF",
  // Text â warm neutrals, easier on the eyes
  "--color-text":           "#1C1917",
  "--color-text-secondary": "#44403C",
  "--color-text-muted":     "#78716C",
  "--color-text-light":     "#A8A29E",
  // Borders â warm stone tones
  "--color-border":         "#E7E5E4",
  "--color-border-light":   "#F5F5F4",
  "--color-border-medium":  "#D6D3D1",
  // Status â clearer, more distinct
  "--color-success":        "#3BC838",
  "--color-success-bg":     "#F0FDF4",
  "--color-blue":           "#2563EB",
  "--color-blue-bg":        "#EFF6FF",
  "--color-blue-border":    "#BFDBFE",
  "--color-danger":         "#DC2626",
  "--color-danger-bg":      "#FEF2F2",
  "--color-danger-border":  "#FECACA",
  "--color-danger-text":    "#991B1B",
  "--color-danger-row":     "#FFFBFB",
  "--color-danger-light":   "#FEE2E2",
  "--color-danger-source":  "#F87171",
  "--color-blocked-border": "#FECACA",
  // Priority â softer, less saturated
  "--color-pri-high-bg":     "#FFF7ED",
  "--color-pri-high-text":   "#9A3412",
  "--color-pri-high-border": "#FED7AA",
  "--color-pri-med-bg":      "#EFF6FF",
  "--color-pri-med-text":    "#1D4ED8",
  "--color-pri-med-border":  "#BFDBFE",
  // Warning / industry info â warm amber
  "--color-warning-bg":     "#FFFBEB",
  "--color-warning-border": "#FDE68A",
  "--color-warning-text":   "#78350F",
  // Header â warm dark green, professional
  "--color-header-bg":     "#1A3A2A",
  "--color-header-text":   "#FFFFFF",
  "--color-header-sub":    "#A7F3D0",
  "--font-sans":            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "--font-size-base":       "14px",
  // Shape
  "--radius-sm":            "6px",
  "--radius-md":            "10px",
  "--radius-lg":            "12px",
  "--radius-xl":            "14px",
};

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   STATUS SYSTEM
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const STATUSES = {
  pending:     { label: "Pending",     color: "var(--color-text-muted)", bg: "var(--color-border-light)", border: "var(--color-border-medium)", icon: null },
  in_progress: { label: "In Progress", color: "var(--color-blue)", bg: "var(--color-blue-bg)", border: "var(--color-blue-border)", icon: "progress" },
  completed:   { label: "Completed",   color: "var(--color-success)", bg: "var(--color-success-bg)", border: "var(--color-soft-border)", icon: "check" },
  blocked:     { label: "Blocked",     color: "var(--color-danger)", bg: "var(--color-danger-bg)", border: "var(--color-danger-border)", icon: "blocked" },
};
const STATUS_ORDER = ["pending", "in_progress", "completed", "blocked"];

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   INDUSTRY PRESETS
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const INDUSTRIES = {
  "digital-marketplace": {
    label: "Digital Marketplace / Gift Cards / Gaming",
    description: "These tasks are specific to digital marketplaces, gift cards, and gaming products. They cover regulatory requirements that could block your ability to accept payments or operate legally. Address critical items before launch.",
    tasks: [
      { id: "ind1", text: "Consult a fintech lawyer on money transmission", description: "Determine if your fund flow requires state money transmitter licenses or qualifies for agent-of-payee exemption. Operating without proper licensing is a federal crime (18 U.S.C. Â§ 1960). Budget $200-500 for a 1-hour consultation.", status: "pending", critical: true },
      { id: "ind2", text: "Implement fraud & chargeback protections", description: "Gift cards are a top fraud category. Add velocity checks, identity verification for high-value purchases, delivery delays for new accounts. Keep chargebacks below 1% or Stripe will shut you down.", status: "pending", critical: true },
      { id: "ind3", text: "Research AML/KYC obligations", description: "If classified as a money services business, you must comply with Bank Secrecy Act â anti-money laundering programs, suspicious activity reporting, and potentially FinCEN registration.", status: "pending", priority: "high", critical: false },
      { id: "ind4", text: "Understand gift card regulations (CARD Act)", description: "Federal and state rules on gift card expiration, fees, and required disclosures. Escheatment laws vary by state for unredeemed balances.", status: "pending", priority: "high", critical: false },
      { id: "ind5", text: "Map your exact payment flow", description: "Document who pays whom, when funds are held, how suppliers are paid. This determines your regulatory obligations. Bring this to your lawyer consultation.", status: "pending", priority: "high", critical: false },
      { id: "ind6", text: "Research digital goods sales tax by state", description: "~30+ states tax digital goods with different rules. Gift cards are usually exempt at purchase but game keys/digital codes may not be.", status: "pending", priority: "medium", critical: false },
    ],
  },
  saas: {
    label: "SaaS / Software as a Service",
    description: "Key regulatory, compliance, and operational tasks for launching a SaaS product. Covers data handling, subscription billing, and enterprise readiness.",
    tasks: [
      { id: "saas1", text: "Implement SOC 2 readiness checklist", description: "Start documenting security policies, access controls, and incident response procedures. SOC 2 Type I is often required for enterprise sales. Use Vanta or Drata to accelerate.", status: "pending", critical: true },
      { id: "saas2", text: "Set up subscription billing & dunning", description: "Stripe Billing or Chargebee for recurring payments. Configure retry logic for failed payments, grace periods, and cancellation flows.", status: "pending", critical: true },
      { id: "saas3", text: "Draft SLA and uptime commitments", description: "Define your uptime target (99.9%?), response times, and what happens when you miss them. Enterprise customers will negotiate these.", status: "pending", priority: "high", critical: false },
      { id: "saas4", text: "Implement data export / portability", description: "Users should be able to export their data. Required by GDPR and builds trust. CSV/JSON export at minimum.", status: "pending", priority: "high", critical: false },
      { id: "saas5", text: "Set up multi-tenant architecture review", description: "Ensure data isolation between customers. Audit database queries for tenant-scoping. One leaked row = trust destroyed.", status: "pending", priority: "high", critical: false },
      { id: "saas6", text: "Configure SSO / SAML for enterprise tier", description: "Enterprise customers expect SSO. Integrate with Okta, Azure AD, or use WorkOS/Auth0 for abstraction.", status: "pending", priority: "medium", critical: false },
    ],
  },
  ecommerce: {
    label: "E-Commerce / Physical Goods",
    description: "Tasks specific to selling physical products online. Covers shipping, inventory, consumer protection, and fulfillment logistics.",
    tasks: [
      { id: "ecom1", text: "Set up shipping & fulfillment pipeline", description: "Choose between self-fulfillment, 3PL (ShipBob, Deliverr), or dropshipping. Define shipping zones, rates, and estimated delivery times.", status: "pending", critical: true },
      { id: "ecom2", text: "Implement inventory management system", description: "Track stock levels, set low-stock alerts, handle backorders. Sync across channels if selling on multiple platforms.", status: "pending", critical: true },
      { id: "ecom3", text: "Understand consumer protection & return laws", description: "FTC cooling-off rule, state return policies, and chargeback rights. Your return policy must be clearly posted before purchase.", status: "pending", priority: "high", critical: false },
      { id: "ecom4", text: "Set up sales tax nexus & collection", description: "Physical presence and economic nexus rules vary by state. Use TaxJar or Avalara. Post-Wayfair, you likely have nexus in 20+ states.", status: "pending", priority: "high", critical: false },
      { id: "ecom5", text: "Product liability insurance", description: "If you manufacture or private-label products, product liability insurance is essential. ~$500-2000/year depending on product category.", status: "pending", priority: "high", critical: false },
      { id: "ecom6", text: "Set up product photography & listing standards", description: "Consistent product images, descriptions, and specs. A/B test listing formats. Good photos = higher conversion.", status: "pending", priority: "medium", critical: false },
    ],
  },
  fintech: {
    label: "Fintech / Financial Services",
    description: "Regulatory and compliance tasks for fintech startups. Financial services are heavily regulated â getting this wrong can mean fines or criminal liability.",
    tasks: [
      { id: "fin1", text: "Engage a fintech-specialized attorney", description: "Not optional. You need counsel who understands money transmission, lending, securities, or payments law depending on your model. Budget $5K-15K initially.", status: "pending", critical: true },
      { id: "fin2", text: "Determine licensing requirements", description: "Money transmitter licenses (state-by-state), broker-dealer registration, lending licenses â depends on your exact product. Some states require surety bonds.", status: "pending", critical: true },
      { id: "fin3", text: "Implement BSA/AML compliance program", description: "Bank Secrecy Act requires: written AML policy, compliance officer, employee training, independent audit, suspicious activity reporting.", status: "pending", critical: true },
      { id: "fin4", text: "Set up KYC/CDD verification", description: "Know Your Customer and Customer Due Diligence. Use Plaid Identity, Persona, or Alloy for identity verification. Tiered verification for different transaction levels.", status: "pending", priority: "high", critical: false },
      { id: "fin5", text: "Choose banking partner / BaaS provider", description: "Partner bank (Unit, Treasury Prime, Synapse) or direct bank charter. BaaS lets you offer banking features without a bank charter.", status: "pending", priority: "high", critical: false },
      { id: "fin6", text: "Implement transaction monitoring", description: "Real-time monitoring for suspicious patterns. Required by regulators and your banking partners. Document all flagged transactions.", status: "pending", priority: "high", critical: false },
    ],
  },
  healthcare: {
    label: "Healthcare / Health Tech",
    description: "HIPAA compliance and healthcare-specific regulatory tasks. Mishandling health data carries severe penalties â up to $1.5M per violation category per year.",
    tasks: [
      { id: "hc1", text: "Conduct HIPAA gap analysis", description: "Determine if you handle PHI (Protected Health Information). If yes, you must comply with HIPAA Privacy, Security, and Breach Notification Rules.", status: "pending", critical: true },
      { id: "hc2", text: "Execute BAAs with all vendors", description: "Business Associate Agreements required with every vendor who touches PHI â hosting, analytics, email, support tools. No BAA = HIPAA violation.", status: "pending", critical: true },
      { id: "hc3", text: "Use HIPAA-compliant infrastructure", description: "AWS, GCP, or Azure with BAA signed. Configure encryption at rest and in transit. Dedicated VPC, audit logging, access controls.", status: "pending", critical: true },
      { id: "hc4", text: "Implement audit logging for PHI access", description: "Log every access to health data â who, when, what, why. Retain logs for 6+ years. Required for HIPAA and useful for breach investigation.", status: "pending", priority: "high", critical: false },
      { id: "hc5", text: "Staff HIPAA training program", description: "All employees with PHI access must be trained annually. Document completion. This is often the first thing auditors check.", status: "pending", priority: "high", critical: false },
      { id: "hc6", text: "Determine FDA regulatory status", description: "If your software provides diagnosis, treatment recommendations, or clinical decision support, it may be classified as a medical device (SaMD).", status: "pending", priority: "medium", critical: false },
    ],
  },
};

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   INITIAL DATA
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const INITIAL_DATA = {
  weeks: [
    {
      id: "week1", title: "Week 1 â Incorporate & Foundation",
      tasks: [
        { id: "w1t1", text: "Incorporate Delaware C-Corp (Stripe Atlas or Clerky)", description: "~$500. Includes certificate of incorporation, bylaws, board consent, stock issuance, EIN.", status: "pending", critical: false },
        { id: "w1t2", text: "Open business bank account", description: "Mercury or Relay (Stripe Atlas bundles Mercury). Never mix personal and business finances.", status: "pending", critical: false },
        { id: "w1t3", text: "Set up 1Password Teams/Business", description: "Create separate vaults: Infrastructure, Finance, Development, Marketing. Migrate all credentials.", status: "pending", critical: false },
        { id: "w1t4", text: "Set up company email (Google Workspace)", description: "team@, support@, admin@ addresses on your domain. Configure SPF, DKIM, DMARC records.", status: "pending", critical: false },
        { id: "w1t5", text: "Secure domain registrar", description: "Enable registrar lock, WHOIS privacy, and 2FA on your domain registrar account.", status: "pending", critical: false },
        { id: "w1t6", text: "Enable 2FA on all critical accounts", description: "Use 1Password as TOTP authenticator. Hardware keys (YubiKey) for domain, hosting, and payment accounts.", status: "pending", critical: false },
      ],
    },
    {
      id: "week2", title: "Week 2 â Legal & Equity",
      tasks: [
        { id: "w2t1", text: "Execute founder stock purchase agreements", description: "Standard: 4-year vesting, 1-year cliff. Define ownership percentages and what happens if someone leaves.", status: "pending", critical: false },
        { id: "w2t2", text: "File 83(b) elections with the IRS", description: "MUST be filed within 30 days of stock issuance. Missing this = massive future tax liability. Non-negotiable.", status: "pending", critical: true },
        { id: "w2t3", text: "Sign IP assignment agreements", description: "Every founder and contractor assigns all IP to the company. Without this, individuals personally own the code.", status: "pending", critical: true },
        { id: "w2t4", text: "Foreign qualify in your home state", description: "If operating outside Delaware, register as a foreign corporation in your home state.", status: "pending", critical: false },
        { id: "w2t5", text: "Set up equity management (Carta or Pulley)", description: "Track cap table, stock grants, vesting schedules. Pulley has a free tier for early startups.", status: "pending", critical: false },
        { id: "w2t6", text: "Set up payment processing", description: "Stripe Connect for marketplaces. Handles buyer payments, fund holding, seller payouts, and tax reporting.", status: "pending", critical: false },
      ],
    },
    {
      id: "week3", title: "Week 3 â Compliance & Policies",
      tasks: [
        { id: "w3t1", text: "Draft Terms of Service", description: "Cover user accounts, acceptable use, payments, refunds, liability limitations, dispute resolution.", status: "pending", critical: false },
        { id: "w3t2", text: "Draft Privacy Policy", description: "GDPR and CCPA compliant. Detail what data you collect, how it's used, stored, and shared.", status: "pending", critical: false },
        { id: "w3t3", text: "Define refund policy", description: "Clear policy for digital goods. Check FTC requirements and state-specific rules for your product category.", status: "pending", critical: false },
        { id: "w3t4", text: "Set up sales tax automation", description: "TaxJar or Avalara integrated with checkout. Research which products are taxable in which states.", status: "pending", critical: false },
        { id: "w3t5", text: "Set up bookkeeping", description: "QuickBooks Online or Xero. Connect to bank account. Categorize every transaction from day one.", status: "pending", critical: false },
        { id: "w3t6", text: "Get business insurance", description: "General liability + cyber liability insurance. ~$500-1500/year. Essential for handling payments and user data.", status: "pending", critical: false },
      ],
    },
    {
      id: "week4", title: "Week 4 â Infrastructure & Launch Readiness",
      tasks: [
        { id: "w4t1", text: "Set up error tracking (Sentry)", description: "Free tier is generous. Catch bugs before users report them.", status: "pending", critical: false },
        { id: "w4t2", text: "Set up analytics (PostHog or Mixpanel)", description: "Track user flows, conversions, and engagement. PostHog is free and open source.", status: "pending", critical: false },
        { id: "w4t3", text: "Set up uptime monitoring", description: "UptimeRobot (free) or Betterstack. Get alerts before users notice downtime.", status: "pending", critical: false },
        { id: "w4t4", text: "Configure automated database backups", description: "Daily automated backups. Test restore process at least once before launch.", status: "pending", critical: false },
        { id: "w4t5", text: "SSL certificates active and auto-renewing", description: "Verify all endpoints use HTTPS. Check certificate auto-renewal is configured.", status: "pending", critical: false },
        { id: "w4t6", text: "Implement rate limiting on API endpoints", description: "Protect against abuse and DDoS. Essential for any public-facing API.", status: "pending", critical: false },
        { id: "w4t7", text: "Write internal runbooks", description: "Site down? Payment failed? Fraud detected? Step-by-step procedures for 2am emergencies.", status: "pending", critical: false },
        { id: "w4t8", text: "Document deployment process", description: "How to deploy, rollback, and hotfix. Written for someone under stress.", status: "pending", critical: false },
        { id: "w4t9", text: "Security audit before launch", description: "Check for exposed API keys, test payment flow end-to-end, review access permissions.", status: "pending", critical: true },
      ],
    },
    {
      id: "ongoing", title: "Ongoing â Team & Operations",
      tasks: [
        { id: "ogt1", text: "Define ownership areas per team member", description: "Who owns product, support, deploys, finances, marketing? Write it down in a shared doc.", status: "pending", critical: false },
        { id: "ogt2", text: "Set up project management tool", description: "Linear (best for product/eng) or Notion (tasks + wiki). Pick one and commit.", status: "pending", critical: false },
        { id: "ogt3", text: "Set up team communication", description: "Discord (free, doubles as community) or Slack (better search/threading). Separate channels by function.", status: "pending", critical: false },
        { id: "ogt4", text: "Establish git workflow", description: "Main is always deployable. Feature branches + PR reviews. CI/CD runs tests on every PR.", status: "pending", critical: false },
        { id: "ogt5", text: "Start a decision log", description: "Track key decisions and reasoning. Future you will thank past you.", status: "pending", critical: false },
        { id: "ogt6", text: "Set up customer support workflow", description: "Shared inbox or help desk (Crisp, Intercom free tier). Define SLAs and escalation paths.", status: "pending", critical: false },
      ],
    },
  ],
  selectedIndustry: "digital-marketplace",
  industryTasks: {},
};

Object.keys(INDUSTRIES).forEach((key) => {
  INITIAL_DATA.industryTasks[key] = JSON.parse(JSON.stringify(INDUSTRIES[key].tasks));
});

function loadState() {
  try { const raw = window.__dashboardState; if (raw) return raw; } catch {} return null;
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   DESIGN TOKEN HELPERS (reference CSS vars)
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const v = (name) => `var(${name})`;
const G = {
  primary: v("--color-primary"),
  primaryLight: v("--color-primary-light"),
  gradFrom: v("--color-primary-dark"),
  gradTo: v("--color-primary-light"),
  accent: v("--color-accent"),
  soft: v("--color-soft"),
  softBorder: v("--color-soft-border"),
  softText: v("--color-accent"),
  bar: `linear-gradient(90deg, #1E8E3E, #34A853)`,
};
const PRI = {
  high:   { bg: "var(--color-pri-high-bg)", text: "var(--color-pri-high-text)", border: "var(--color-pri-high-border)", label: "High Priority", tip: "Should be done before launch" },
  medium: { bg: "var(--color-pri-med-bg)", text: "var(--color-pri-med-text)", border: "var(--color-pri-med-border)", label: "Medium Priority", tip: "Important but won't block launch" },
};

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   SVG ICONS
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const CheckSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ProgressSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" fill="white"/></svg>;
const BlockedSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>;
const Chev = ({ open }) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transition:"transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}><path d="M5 7.5L10 12.5L15 7.5" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const AlertIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const ExportSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ResetSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const ShareSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const Pencil = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const Trash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const Plus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const DropChev = ({ open }) => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ transition:"transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}><path d="M5 7.5L10 12.5L15 7.5" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const FlagIcon = ({ active }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? "var(--color-danger)" : "none"} stroke={active ? "var(--color-danger)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const PaletteSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
const ShieldSvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UserSvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   PROGRESS BAR
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, width:"100%" }}>
      <div style={{ flex:1, height:8, background:"var(--color-border)", borderRadius:99 }}>
        <div style={{ width:`${pct}%`, height:"100%", background: pct===100 ? "var(--color-success)" : G.bar, borderRadius:99, transition:"width .4s ease" }} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color: pct===100 ? "#1E8E3E" : "#1E8E3E", minWidth:42, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   ACTION BUTTON (hover icon)
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function ActionBtn({ children, onClick, hoverClass, title }) {
  return (
    <button onClick={onClick} title={title} className={`act-btn ${hoverClass || "hover-edit"}`}>{children}</button>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   STATUS PICKER (dropdown on the checkbox)
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function StatusCheckbox({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const s = STATUSES[status] || STATUSES.pending;

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const boxBg = status === "completed" ? "var(--color-success)" : status === "in_progress" ? "var(--color-blue)" : status === "blocked" ? "var(--color-danger)" : "var(--color-surface)";
  const boxBorder = status === "pending" ? "2px solid var(--color-border-medium)" : "none";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }} title={`Status: ${s.label} â Click to change`}
        style={{ width:22, height:22, minWidth:22, borderRadius:"var(--radius-sm)", border:boxBorder, background:boxBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginTop:1, transition:"all .2s" }}>
        {status === "completed" && <CheckSvg />}
        {status === "in_progress" && <ProgressSvg />}
        {status === "blocked" && <BlockedSvg />}
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:8, boxShadow:"0 8px 30px rgba(0,0,0,.12)", zIndex:60, overflow:"hidden", width:160 }}>
          {STATUS_ORDER.map(key => {
            const st = STATUSES[key];
            const active = status === key;
            return (
              <div key={key} onClick={e => { e.stopPropagation(); onChange(key); setOpen(false); }}
                className={active ? "" : "status-option"}
                style={{ padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight: active ? 600 : 400, color: active ? st.color : "var(--color-text-secondary)", background: active ? st.bg : "var(--color-surface)", transition:"all .1s" }}>
                <div style={{ width:10, height:10, borderRadius:99, background: st.color, opacity: active ? 1 : 0.4 }} />
                {st.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   TASK ROW
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function TaskRow({ task, onStatusChange, onEdit, onDelete, onToggleCritical }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDesc, setEditDesc] = useState(task.description);
  const done = task.status === "completed";
  const isCritical = task.critical;

  const save = () => { if (editText.trim()) { onEdit(task.id, editText.trim(), editDesc.trim()); setEditing(false); } };
  const cancel = () => { setEditText(task.text); setEditDesc(task.description); setEditing(false); };

  const statusMeta = STATUSES[task.status] || STATUSES.pending;

  /* ââ Edit mode ââ */
  if (editing) {
    return (
      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--color-border-light)", background:"var(--color-soft)" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); save(); } if (e.key==="Escape") cancel(); }}
            placeholder="Task title"
            style={{ fontSize:"var(--font-size-base)", fontWeight:500, padding:"8px 12px", border:`1px solid var(--color-soft-border)`, borderRadius:"var(--radius-sm)", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"var(--font-sans)" }} />
          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => { if (e.key==="Escape") cancel(); }}
            placeholder="Description (optional)" rows={2}
            style={{ fontSize:13, padding:"8px 12px", color:"var(--color-text-muted)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", outline:"none", width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"var(--font-sans)" }} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={cancel} style={{ padding:"6px 14px", fontSize:12, fontWeight:500, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", cursor:"pointer" }}>Cancel</button>
            <button onClick={save} style={{ padding:"6px 14px", fontSize:12, fontWeight:500, background:G.primary, color:"white", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer" }}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  /* ââ Normal mode ââ */
  const rowBg = isCritical ? "var(--color-danger-row)" : done ? "var(--color-border-light)" : "var(--color-surface)";

  return (
    <div className={`task-row ${isCritical ? "critical-row" : ""}`} style={{ padding:"12px 16px", borderBottom:"1px solid var(--color-border-light)", cursor:"pointer", transition:"background .15s", background: rowBg, borderLeft: isCritical ? "3px solid var(--color-danger)" : "3px solid transparent" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <StatusCheckbox status={task.status} onChange={s => onStatusChange(task.id, s)} />
        <div style={{ flex:1 }} onClick={() => setExpanded(!expanded)}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:"var(--font-size-base)", fontWeight:500, color: done ? "var(--color-text-light)" : "var(--color-text)", textDecoration: done ? "line-through" : "none", lineHeight:1.5, flex:1 }}>{task.text}</span>
            {/* Status badge (non-pending, non-completed) */}
            {task.status !== "pending" && task.status !== "completed" && (
              <span title={task.status === "in_progress" ? "Currently being worked on" : "Waiting on external dependency"} style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background: statusMeta.bg, color: statusMeta.color, border:`1px solid ${statusMeta.border}`, whiteSpace:"nowrap", cursor:"help" }}>
                {statusMeta.label}
              </span>
            )}
            {/* Priority badge */}
            {task.priority && PRI[task.priority] && (
              <span title={PRI[task.priority].tip} style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background: PRI[task.priority].bg, color: PRI[task.priority].text, border:`1px solid ${PRI[task.priority].border}`, whiteSpace:"nowrap", cursor:"help" }}>
                {PRI[task.priority].label}
              </span>
            )}
            {/* Critical badge */}
            {isCritical && (
              <span title="Flagged as critical â appears in the critical items panel above" style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:"var(--color-danger)", color:"white", whiteSpace:"nowrap", letterSpacing:0.3, cursor:"help" }}>
                CRITICAL
              </span>
            )}
            {/* Action buttons */}
            <div style={{ display:"flex", gap:2 }} onClick={e => e.stopPropagation()}>
              <ActionBtn onClick={() => onToggleCritical(task.id)} hoverClass={isCritical ? "hover-unflag" : "hover-flag"} title={isCritical ? "Remove critical flag" : "Flag as critical â appears in alert panel above"}><FlagIcon active={isCritical} /></ActionBtn>
              <ActionBtn onClick={() => { setEditText(task.text); setEditDesc(task.description); setEditing(true); }} hoverClass="hover-edit" title="Edit task title and description"><Pencil /></ActionBtn>
              <ActionBtn onClick={() => onDelete(task.id)} hoverClass="hover-delete" title="Delete this task"><Trash /></ActionBtn>
            </div>
            <span title={expanded ? "Collapse details" : "Expand details"}><Chev open={expanded} /></span>
          </div>
          {expanded && <p style={{ margin:"8px 0 4px", fontSize:13, color:"var(--color-text-muted)", lineHeight:1.6 }}>{task.description}</p>}
        </div>
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   ADD TASK INLINE
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function AddTaskRow({ onAdd, showPriority }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("high");

  const add = () => { if (text.trim()) { onAdd(text.trim(), desc.trim(), showPriority ? priority : null); setText(""); setDesc(""); setPriority("high"); setAdding(false); } };

  if (!adding) {
    return (
      <button onClick={() => setAdding(true)} title="Add a new task to this section" className="add-task-btn"
        style={{ width:"100%", padding:"12px 16px", display:"flex", alignItems:"center", gap:8, background:"transparent", border:"none", borderTop:"1px dashed var(--color-border)", cursor:"pointer", color:"var(--color-text-light)", fontSize:13, fontWeight:500, fontFamily:"var(--font-sans)" }}>
        <Plus /> Add task
      </button>
    );
  }

  return (
    <div style={{ padding:"12px 16px", borderTop:"1px solid var(--color-border-light)", background:"var(--color-soft)" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <input autoFocus value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter") add(); if (e.key==="Escape") setAdding(false); }}
          placeholder="Task title" style={{ fontSize:"var(--font-size-base)", fontWeight:500, padding:"8px 12px", border:`1px solid var(--color-soft-border)`, borderRadius:"var(--radius-sm)", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"var(--font-sans)" }} />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" rows={2}
          style={{ fontSize:13, padding:"8px 12px", color:"var(--color-text-muted)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", outline:"none", width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"var(--font-sans)" }} />
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"space-between", flexWrap:"wrap" }}>
          {showPriority ? (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Priority:</span>
              {["high","medium"].map(p => (
                <button key={p} onClick={() => setPriority(p)} title={PRI[p].tip}
                  style={{ fontSize:11, fontWeight:600, padding:"2px 10px", borderRadius:99, background: priority===p ? PRI[p].bg : "var(--color-surface)", color: priority===p ? PRI[p].text : "var(--color-text-light)", border:`1px solid ${priority===p ? PRI[p].border : "var(--color-border)"}`, cursor:"pointer", transition:"all .15s" }}>
                  {PRI[p].label}
                </button>
              ))}
            </div>
          ) : <div />}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setAdding(false)} style={{ padding:"6px 14px", fontSize:12, fontWeight:500, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", cursor:"pointer" }}>Cancel</button>
            <button onClick={add} style={{ padding:"6px 14px", fontSize:12, fontWeight:500, background:G.primary, color:"white", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer" }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   WEEK SECTION
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function WeekSection({ week, defaultWeek, onStatusChange, onEditTask, onDeleteTask, onAddTask, onRenameWeek, onDeleteWeek, onResetWeek, onToggleCritical, defaultOpen, isAdmin }) {
  const [open, setOpen] = useState(defaultOpen);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(week.title);
  const completed = week.tasks.filter(t => t.status === "completed").length;
  const total = week.tasks.length;
  const allDone = completed === total && total > 0;
  const hasDefault = !!defaultWeek;

  const saveRename = () => { if (renameVal.trim()) { onRenameWeek(week.id, renameVal.trim()); setRenaming(false); } };

  return (
    <div className="section-card" style={{ background:"var(--color-surface)", borderRadius:"var(--radius-lg)", border:"1px solid var(--color-border)", boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
      <div className="week-header" style={{ padding:"16px 20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: open ? "1px solid var(--color-border-light)" : "none", transition:"background .15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }} onClick={() => setOpen(!open)}>
          <Chev open={open} />
          {renaming ? (
            <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key==="Enter") saveRename(); if (e.key==="Escape"){ setRenameVal(week.title); setRenaming(false); } }}
              onBlur={saveRename}
              className="responsive-rename-input"
              style={{ fontSize:15, fontWeight:600, color:"var(--color-text)", border:`1px solid var(--color-soft-border)`, borderRadius:"var(--radius-sm)", padding:"2px 8px", outline:"none", width:260, fontFamily:"var(--font-sans)" }} />
          ) : (
            <h3 style={{ margin:0, fontSize:15, fontWeight:600, color:"var(--color-text)" }}>{week.title}</h3>
          )}
          {allDone && <span style={{ fontSize:11, fontWeight:600, color:"var(--color-success)", background:"var(--color-success-bg)", padding:"2px 10px", borderRadius:99 }}>Complete</span>}
        </div>
        <div className="week-header-right" style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", gap:2, alignItems:"center" }} onClick={e => e.stopPropagation()}>
            <SectionThemeBtn sectionKey="cards" visible={isAdmin} />
            {hasDefault && (
              <ActionBtn onClick={() => onResetWeek(week.id)} hoverClass="hover-reset" title="Reset this section to its original tasks"><ResetSvg /></ActionBtn>
            )}
            <ActionBtn onClick={() => { setRenameVal(week.title); setRenaming(true); }} hoverClass="hover-edit" title="Rename this section"><Pencil /></ActionBtn>
            <ActionBtn onClick={() => onDeleteWeek(week.id)} hoverClass="hover-delete" title="Delete this entire section"><Trash /></ActionBtn>
          </div>
          <span style={{ fontSize:12, color:"var(--color-text-light)", whiteSpace:"nowrap" }}>{completed}/{total}</span>
          <div style={{ width:100 }}><ProgressBar completed={completed} total={total} /></div>
        </div>
        {/* Mobile-only compact version */}
        <div className="week-header-right-mobile" style={{ display:"none", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"var(--color-text-light)", whiteSpace:"nowrap" }}>{completed}/{total}</span>
          <div style={{ display:"flex", gap:2, alignItems:"center" }} onClick={e => e.stopPropagation()}>
            <ActionBtn onClick={() => { setRenameVal(week.title); setRenaming(true); }} hoverClass="hover-edit" title="Rename"><Pencil /></ActionBtn>
            <ActionBtn onClick={() => onDeleteWeek(week.id)} hoverClass="hover-delete" title="Delete"><Trash /></ActionBtn>
          </div>
        </div>
      </div>
      {open && (
        <div>
          {week.tasks.map(task => (
            <TaskRow key={task.id} task={task} onStatusChange={(id,s) => onStatusChange(week.id,id,s)} onEdit={(id,t,d) => onEditTask(week.id,id,t,d)} onDelete={id => onDeleteTask(week.id,id)} onToggleCritical={id => onToggleCritical(week.id,id)} />
          ))}
          <AddTaskRow onAdd={(t,d) => onAddTask(week.id,t,d)} showPriority={false} />
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   SEARCHABLE DROPDOWN
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function IndustryDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const entries = Object.entries(INDUSTRIES);
  const filtered = entries.filter(([, ind]) => ind.label.toLowerCase().includes(search.toLowerCase()));
  const current = INDUSTRIES[selected];

  return (
    <div ref={ref} style={{ position:"relative", marginBottom:16 }}>
      <button onClick={() => { setOpen(!open); setSearch(""); }}
        style={{ width:"100%", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--color-surface)", border:`1px solid ${open ? "var(--color-primary)" : "var(--color-border-medium)"}`, borderRadius:"var(--radius-md)", cursor:"pointer", fontSize:"var(--font-size-base)", fontWeight:500, color:"var(--color-text)", transition:"border .15s", boxShadow: open ? `0 0 0 3px var(--color-soft)` : "none", fontFamily:"var(--font-sans)" }}>
        <span>{current?.label || "Select industry..."}</span>
        <DropChev open={open} />
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-md)", boxShadow:"0 10px 40px rgba(0,0,0,.12)", zIndex:50, overflow:"hidden" }}>
          <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--color-border-light)", display:"flex", alignItems:"center", gap:8 }}>
            <SearchSvg />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search industries..."
              style={{ border:"none", outline:"none", fontSize:13, flex:1, color:"var(--color-text)", background:"transparent", fontFamily:"var(--font-sans)" }} />
          </div>
          <div style={{ maxHeight:240, overflowY:"auto" }}>
            {filtered.length === 0 && <div style={{ padding:16, fontSize:13, color:"var(--color-text-light)", textAlign:"center" }}>No industries found</div>}
            {filtered.map(([key, ind]) => (
              <div key={key} onClick={() => { onChange(key); setOpen(false); setSearch(""); }}
                className={`ind-option ${selected===key ? "active" : ""}`}
                style={{ padding:"10px 14px", cursor:"pointer", fontSize:13, fontWeight: selected===key ? 600 : 400, color: selected===key ? G.accent : "var(--color-text-secondary)", background: selected===key ? G.soft : "var(--color-surface)", transition:"all .1s", borderLeft: selected===key ? `3px solid var(--color-primary)` : "3px solid transparent" }}>
                {ind.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   CRITICAL ITEMS PANEL
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function CriticalPanel({ items, title, onTitleChange, isAdmin }) {
  if (items.length === 0) return null;
  const incomplete = items.filter(i => i.status !== "completed");
  if (incomplete.length === 0) return null;

  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(title);

  const save = () => { if (editVal.trim()) { onTitleChange(editVal.trim()); } setEditing(false); };

  return (
    <div style={{ background:"var(--color-danger-bg)", border:"1px solid var(--color-danger-border)", borderRadius:"var(--radius-md)", marginBottom:24, overflow:"hidden", position:"relative" }}>
      {isAdmin && <div style={{ position:"absolute", top:10, right:10 }}><SectionThemeBtn sectionKey="critical" visible={isAdmin} /></div>}
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:10, paddingRight: isAdmin ? 44 : 18 }}>
        <AlertIcon />
        {isAdmin && editing ? (
          <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditVal(title); setEditing(false); } }}
            onBlur={save}
            style={{ fontSize:13, fontWeight:600, color:"var(--color-danger-text)", background:"var(--color-surface)", border:"1px solid var(--color-danger-border)", borderRadius:"var(--radius-sm)", padding:"2px 8px", outline:"none", flex:1, fontFamily:"var(--font-sans)" }} />
        ) : (
          <p onClick={isAdmin ? () => { setEditVal(title); setEditing(true); } : undefined}
            title={isAdmin ? "Click to edit this title" : undefined}
            className={isAdmin ? "critical-title-editable" : ""}
            style={{ margin:0, fontSize:13, color:"var(--color-danger-text)", fontWeight:600, cursor: isAdmin ? "pointer" : "default", borderBottom:"1px dashed transparent", transition:"border-color .15s" }}>
            {title.replace("{count}", incomplete.length)}
          </p>
        )}
      </div>
      <div style={{ borderTop:"1px solid var(--color-danger-border)" }}>
        {incomplete.map((item, idx) => (
          <div key={item.id} style={{ padding:"10px 18px 10px 22px", borderBottom: idx < incomplete.length - 1 ? "1px solid var(--color-danger-light)" : "none", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:99, background: STATUSES[item.status]?.color || "var(--color-text-muted)", flexShrink:0 }} />
            <span style={{ fontSize:13, color:"var(--color-danger-text)", fontWeight:500, flex:1 }}>{item.text}</span>
            <span style={{ fontSize:11, color:"var(--color-danger-text)", fontWeight:600, whiteSpace:"nowrap", opacity:0.7 }}>{item.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION THEME CONFIG â defines per-section tokens
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const SECTION_THEMES = {
  header: {
    label: "Header",
    tokens: [
      { label: "Background", var: "--color-header-bg" },
      { label: "Title", var: "--color-header-text" },
      { label: "Subtitle", var: "--color-header-sub" },
    ],
  },
  progress: {
    label: "Progress Card",
    tokens: [
      { label: "Gradient Start", var: "--color-primary-dark" },
      { label: "Gradient End", var: "--color-primary-light" },
      { label: "Primary", var: "--color-primary" },
      { label: "Accent", var: "--color-accent" },
    ],
  },
  critical: {
    label: "Critical Panel",
    tokens: [
      { label: "Background", var: "--color-danger-bg" },
      { label: "Border", var: "--color-danger-border" },
      { label: "Text", var: "--color-danger-text" },
      { label: "Row Tint", var: "--color-danger-row" },
      { label: "Row Divider", var: "--color-danger-light" },
      { label: "Icon / Badge", var: "--color-danger" },
      { label: "Source Label", var: "--color-danger-source" },
    ],
  },
  cards: {
    label: "Task Cards",
    tokens: [
      { label: "Card Background", var: "--color-surface" },
      { label: "Card Border", var: "--color-border" },
      { label: "Row Divider", var: "--color-border-light" },
      { label: "Hover Tint", var: "--color-soft" },
      { label: "Text", var: "--color-text" },
      { label: "Muted Text", var: "--color-text-muted" },
      { label: "Light Text", var: "--color-text-light" },
    ],
  },
  status: {
    label: "Status Colors",
    tokens: [
      { label: "Completed", var: "--color-success" },
      { label: "Completed BG", var: "--color-success-bg" },
      { label: "In Progress", var: "--color-blue" },
      { label: "In Progress BG", var: "--color-blue-bg" },
      { label: "Blocked", var: "--color-danger" },
      { label: "Blocked BG", var: "--color-danger-bg" },
    ],
  },
  priority: {
    label: "Priority Badges",
    tokens: [
      { label: "High BG", var: "--color-pri-high-bg" },
      { label: "High Text", var: "--color-pri-high-text" },
      { label: "High Border", var: "--color-pri-high-border" },
      { label: "Medium BG", var: "--color-pri-med-bg" },
      { label: "Medium Text", var: "--color-pri-med-text" },
      { label: "Medium Border", var: "--color-pri-med-border" },
    ],
  },
  industry: {
    label: "Industry Info",
    tokens: [
      { label: "Background", var: "--color-warning-bg" },
      { label: "Border", var: "--color-warning-border" },
      { label: "Text", var: "--color-warning-text" },
    ],
  },
};

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION THEME BUTTON (opens a right panel)
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const PaintSvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17" cy="10.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12" r="1" fill="currentColor"/></svg>;

function SectionThemeBtn({ sectionKey, visible = true }) {
  const section = SECTION_THEMES[sectionKey];
  if (!section || !visible) return null;
  return (
    <button onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("open-section-panel", { detail: sectionKey })); }}
      title={`Edit ${section.label}`}
      className="section-theme-btn"
      style={{ width:26, height:26, borderRadius:"var(--radius-sm)", border:"none", background:"transparent", cursor:"pointer", color:"var(--color-text-light)", display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all .15s", padding:0 }}>
      <PaintSvg />
    </button>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION EDITOR RIGHT PANEL
   âââââââââââââââââââââââââââââââââââââââââââââââ */
function SectionEditorPanel({ texts, onTextChange }) {
  const [activeSection, setActiveSection] = useState(null);
  const [tokens, setTokens] = useState({});

  // Listen for open events from SectionThemeBtn
  useEffect(() => {
    const handler = e => {
      const key = e.detail;
      setActiveSection(prev => prev === key ? null : key);
      // Snapshot current computed values for color pickers
      const section = SECTION_THEMES[key];
      if (section) {
        const style = getComputedStyle(document.documentElement);
        const snap = {};
        section.tokens.forEach(t => {
          snap[t.var] = style.getPropertyValue(t.var).trim() || THEME_DEFAULTS[t.var] || "#000000";
        });
        setTokens(snap);
      }
    };
    window.addEventListener("open-section-panel", handler);
    return () => window.removeEventListener("open-section-panel", handler);
  }, []);

  // Listen for theme-reset
  useEffect(() => {
    const handler = () => setActiveSection(null);
    window.addEventListener("theme-reset", handler);
    return () => window.removeEventListener("theme-reset", handler);
  }, []);

  const section = activeSection ? SECTION_THEMES[activeSection] : null;
  const isOpen = !!section;

  const setVal = (varName, value) => {
    const v = typeof value === "string" && value.startsWith("#") ? value.toUpperCase() : value;
    document.documentElement.style.setProperty(varName, v);
    setTokens(prev => ({ ...prev, [varName]: v }));
  };

  const resetSection = () => {
    if (!section) return;
    const snap = {};
    section.tokens.forEach(t => {
      document.documentElement.style.setProperty(t.var, THEME_DEFAULTS[t.var]);
      snap[t.var] = THEME_DEFAULTS[t.var];
    });
    setTokens(snap);
  };

  const setFont = (value) => {
    document.documentElement.style.setProperty("--font-sans", value);
    const name = value.split(",")[0].replace(/'/g, "").trim();
    if (name !== "-apple-system") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  // Determine which text fields to show based on active section
  const textFields = [];
  if (activeSection === "header" && texts) {
    textFields.push({ key: "headerTitle", label: "Dashboard title", value: texts.headerTitle || "" });
    textFields.push({ key: "progressSubtitle", label: "Subtitle", value: texts.progressSubtitle || "" });
  }
  if (activeSection === "critical" && texts) {
    textFields.push({ key: "criticalTitle", label: "Panel heading", help: "Use {count} for the number of items", value: texts.criticalTitle || "" });
  }
  if (activeSection === "progress" && texts) {
    textFields.push({ key: "progressTitle", label: "Card title", value: texts.progressTitle || "" });
    textFields.push({ key: "progressSubtitle", label: "Subtitle", value: texts.progressSubtitle || "" });
  }

  return (
    <div className={`responsive-side-panel ${isOpen ? "" : "panel-closed"}`} style={{
      position:"fixed", right: isOpen ? 0 : -320, top:0, height:"100vh", width:300,
      background:"var(--color-surface)", borderLeft:"1px solid var(--color-border)",
      boxShadow: isOpen ? "0 0 40px rgba(0,0,0,.12)" : "none", zIndex:9997, overflowY:"auto",
      transition:"right 0.3s cubic-bezier(.4,0,.2,1)", padding: isOpen ? 20 : 0,
      fontFamily:"var(--font-sans)",
    }}>
      {section && (
        <>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <span style={{ fontSize:15, fontWeight:600, color:"var(--color-text)" }}>{section.label}</span>
            <button onClick={() => setActiveSection(null)}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--color-text-muted)", padding:4 }}>Ã</button>
          </div>

          {/* Text fields */}
          {textFields.length > 0 && (
            <>
              <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Text</h4>
              {textFields.map(f => (
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, color:"var(--color-text-muted)", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input value={f.value} onChange={e => onTextChange(f.key, e.target.value)}
                    style={{ width:"100%", fontSize:13, padding:"6px 10px", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", outline:"none", color:"var(--color-text)", background:"var(--color-bg)", boxSizing:"border-box", fontFamily:"var(--font-sans)" }} />
                  {f.help && <span style={{ fontSize:10, color:"var(--color-text-light)", marginTop:2, display:"block" }}>{f.help}</span>}
                </div>
              ))}
              <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />
            </>
          )}

          {/* Colors */}
          <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Colors</h4>
          {section.tokens.map(t => {
            const currentVal = tokens[t.var] || THEME_DEFAULTS[t.var] || "#000000";
            return (
              <div key={t.var} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:12, color:"var(--color-text-muted)", flex:1 }}>{t.label}</span>
                <input type="text" value={currentVal}
                  onChange={e => setVal(t.var, e.target.value)}
                  onBlur={e => { const v = e.target.value.trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(v)) setVal(t.var, v); }}
                  style={{ width:72, padding:"3px 6px", fontSize:11, fontFamily:"monospace", border:"1px solid var(--color-border)", borderRadius:4, color:"var(--color-text)", background:"var(--color-surface)", outline:"none", boxSizing:"border-box" }} />
                <input type="color" value={currentVal.startsWith("#") ? currentVal : "#000000"}
                  onChange={e => setVal(t.var, e.target.value)}
                  style={{ width:30, height:24, border:"1px solid var(--color-border)", borderRadius:4, cursor:"pointer", padding:1, background:"var(--color-surface)", flexShrink:0 }} />
              </div>
            );
          })}

          <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

          {/* Font */}
          <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Font</h4>
          <select onChange={e => setFont(e.target.value)}
            style={{ width:"100%", fontSize:12, padding:"6px 10px", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", background:"var(--color-bg)", color:"var(--color-text)", cursor:"pointer", marginBottom:8 }}>
            {FONT_OPTIONS.map(f => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, marginTop:8 }}>
            <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Base size</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input type="range" min="12" max="18" defaultValue="14"
                onChange={e => document.documentElement.style.setProperty("--font-size-base", e.target.value + "px")}
                style={{ width:80, accentColor:"var(--color-primary)" }} />
            </div>
          </div>

          <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

          {/* Reset section */}
          <button onClick={resetSection}
            style={{ width:"100%", padding:8, border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", background:"none", cursor:"pointer", fontSize:12, color:"var(--color-text-muted)", fontFamily:"var(--font-sans)", transition:"all .15s" }}>
            Reset {section.label} colors
          </button>
        </>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   THEME EDITOR PANEL
   âââââââââââââââââââââââââââââââââââââââââââââââ */
const FONT_OPTIONS = [
  { label: "System Default", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Nunito", value: "'Nunito', sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
];

function ThemeEditor() {
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState(() => ({ ...THEME_DEFAULTS }));
  const [dark, setDark] = useState(false);

  // Listen for external reset (e.g. "Reset Everything" button)
  useEffect(() => {
    const handler = () => { setTokens({ ...THEME_DEFAULTS }); setDark(false); };
    window.addEventListener("theme-reset", handler);
    return () => window.removeEventListener("theme-reset", handler);
  }, []);

  const setToken = (prop, value) => {
    const v = typeof value === "string" && value.startsWith("#") ? value.toUpperCase() : value;
    document.documentElement.style.setProperty(prop, v);
    setTokens(prev => ({ ...prev, [prop]: v }));
  };

  const setFont = (value) => {
    setToken("--font-sans", value);
    const name = value.split(",")[0].replace(/'/g, "").trim();
    if (name !== "-apple-system") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  const toggleDark = (on) => {
    setDark(on);
    if (on) {
      setToken("--color-bg", "#0F1117");
      setToken("--color-surface", "#1A1D27");
      setToken("--color-text", "#F1F5F9");
      setToken("--color-text-secondary", "#E2E8F0");
      setToken("--color-text-muted", "#94A3B8");
      setToken("--color-text-light", "#64748B");
      setToken("--color-border", "#2D3748");
      setToken("--color-border-light", "#1E293B");
      setToken("--color-border-medium", "#475569");
    } else {
      setToken("--color-bg", THEME_DEFAULTS["--color-bg"]);
      setToken("--color-surface", THEME_DEFAULTS["--color-surface"]);
      setToken("--color-text", THEME_DEFAULTS["--color-text"]);
      setToken("--color-text-secondary", THEME_DEFAULTS["--color-text-secondary"]);
      setToken("--color-text-muted", THEME_DEFAULTS["--color-text-muted"]);
      setToken("--color-text-light", THEME_DEFAULTS["--color-text-light"]);
      setToken("--color-border", THEME_DEFAULTS["--color-border"]);
      setToken("--color-border-light", THEME_DEFAULTS["--color-border-light"]);
      setToken("--color-border-medium", THEME_DEFAULTS["--color-border-medium"]);
    }
  };

  const resetTheme = () => {
    setDark(false);
    Object.entries(THEME_DEFAULTS).forEach(([k, val]) => {
      document.documentElement.style.setProperty(k, val);
    });
    setTokens({ ...THEME_DEFAULTS });
  };

  const colorRow = (label, varName) => {
    const currentVal = tokens[varName] || "#000000";
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontSize:12, color:"var(--color-text-muted)", flex:1 }}>{label}</span>
        <input type="text" value={currentVal}
          onChange={e => setToken(varName, e.target.value)}
          onBlur={e => { const v = e.target.value.trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(v)) setToken(varName, v); }}
          style={{ width:72, padding:"3px 6px", fontSize:11, fontFamily:"monospace", border:"1px solid var(--color-border)", borderRadius:4, color:"var(--color-text)", background:"var(--color-surface)", outline:"none", boxSizing:"border-box" }} />
        <input type="color" value={currentVal.startsWith("#") ? currentVal : "#000000"}
          onChange={e => setToken(varName, e.target.value)}
          style={{ width:30, height:24, border:"1px solid var(--color-border)", borderRadius:4, cursor:"pointer", padding:1, background:"var(--color-surface)", flexShrink:0 }} />
      </div>
    );
  };

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(!open)} title="Open Theme Editor"
        style={{ position:"fixed", bottom:20, right:20, zIndex:9999, width:44, height:44, borderRadius:"50%", background:"var(--color-primary)", color:"#fff", border:"none", cursor:"pointer", fontSize:20, boxShadow:"0 4px 16px rgba(0,0,0,.2)", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
        <PaletteSvg />
      </button>

      {/* Panel */}
      <div className={`responsive-side-panel ${open ? "" : "panel-closed"}`} style={{
        position:"fixed", right: open ? 0 : -320, top:0, height:"100vh", width:300,
        background:"var(--color-surface)", borderLeft:"1px solid var(--color-border)",
        boxShadow:"0 0 40px rgba(0,0,0,.15)", zIndex:9998, overflowY:"auto",
        transition:"right 0.3s cubic-bezier(.4,0,.2,1)", padding:20,
        fontFamily:"var(--font-sans)",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:600, color:"var(--color-text)" }}>Theme Editor</span>
          <button onClick={() => setOpen(false)}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--color-text-muted)", padding:4 }}>
            Ã
          </button>
        </div>

        {/* Brand Colors */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Brand</h4>
        {colorRow("Primary", "--color-primary")}
        {colorRow("Primary Light", "--color-primary-light")}
        {colorRow("Primary Dark", "--color-primary-dark")}
        {colorRow("Accent", "--color-accent")}
        {colorRow("Soft Background", "--color-soft")}
        {colorRow("Soft Border", "--color-soft-border")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Layout */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Layout</h4>
        {colorRow("Background", "--color-bg")}
        {colorRow("Surface", "--color-surface")}
        {colorRow("Text", "--color-text")}
        {colorRow("Text Secondary", "--color-text-secondary")}
        {colorRow("Text Muted", "--color-text-muted")}
        {colorRow("Text Light", "--color-text-light")}
        {colorRow("Border", "--color-border")}
        {colorRow("Border Light", "--color-border-light")}
        {colorRow("Border Medium", "--color-border-medium")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Status Colors */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Status</h4>
        {colorRow("Completed", "--color-success")}
        {colorRow("Completed BG", "--color-success-bg")}
        {colorRow("In Progress", "--color-blue")}
        {colorRow("In Progress BG", "--color-blue-bg")}
        {colorRow("In Progress Border", "--color-blue-border")}
        {colorRow("Blocked / Danger", "--color-danger")}
        {colorRow("Danger BG", "--color-danger-bg")}
        {colorRow("Danger Border", "--color-danger-border")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Critical Panel */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Critical Panel</h4>
        {colorRow("Panel Text", "--color-danger-text")}
        {colorRow("Row Background", "--color-danger-row")}
        {colorRow("Row Divider", "--color-danger-light")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Priority Badges */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Priority Badges</h4>
        {colorRow("High BG", "--color-pri-high-bg")}
        {colorRow("High Text", "--color-pri-high-text")}
        {colorRow("High Border", "--color-pri-high-border")}
        {colorRow("Medium BG", "--color-pri-med-bg")}
        {colorRow("Medium Text", "--color-pri-med-text")}
        {colorRow("Medium Border", "--color-pri-med-border")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Warning / Industry Info */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Industry Info Panel</h4>
        {colorRow("Warning BG", "--color-warning-bg")}
        {colorRow("Warning Border", "--color-warning-border")}
        {colorRow("Warning Text", "--color-warning-text")}

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Typography */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Typography</h4>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Font</span>
          <select onChange={e => setFont(e.target.value)}
            style={{ fontSize:12, padding:"4px 8px", border:"1px solid var(--color-border)", borderRadius:6, background:"var(--color-bg)", color:"var(--color-text)", cursor:"pointer" }}>
            {FONT_OPTIONS.map(f => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Base size</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="range" min="12" max="18" defaultValue="14"
              onChange={e => setToken("--font-size-base", e.target.value + "px")}
              style={{ width:100, accentColor:"var(--color-primary)" }} />
            <span style={{ fontSize:11, color:"var(--color-text-muted)", width:32 }}>{tokens["--font-size-base"]}</span>
          </div>
        </div>

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Shape */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Shape</h4>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Border radius</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="range" min="0" max="24" defaultValue="10"
              onChange={e => {
                const val = parseInt(e.target.value);
                setToken("--radius-sm", Math.round(val * 0.6) + "px");
                setToken("--radius-md", val + "px");
                setToken("--radius-lg", Math.round(val * 1.2) + "px");
                setToken("--radius-xl", Math.round(val * 1.4) + "px");
              }}
              style={{ width:100, accentColor:"var(--color-primary)" }} />
            <span style={{ fontSize:11, color:"var(--color-text-muted)", width:32 }}>{tokens["--radius-md"]}</span>
          </div>
        </div>

        <hr style={{ border:"none", borderTop:"1px solid var(--color-border)", margin:"16px 0" }} />

        {/* Dark mode */}
        <h4 style={{ fontSize:12, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px" }}>Mode</h4>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>Dark mode</span>
          <input type="checkbox" checked={dark} onChange={e => toggleDark(e.target.checked)}
            style={{ width:18, height:18, accentColor:"var(--color-primary)", cursor:"pointer" }} />
        </div>

        {/* Reset */}
        <button onClick={resetTheme}
          style={{ width:"100%", marginTop:16, padding:8, border:"1px solid var(--color-border)", borderRadius:"var(--radius-md)", background:"none", cursor:"pointer", fontSize:13, color:"var(--color-text-muted)", transition:"all .15s", fontFamily:"var(--font-sans)" }}>
          Reset to defaults
        </button>
      </div>
    </>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââ
   MAIN DASHBOARD
   âââââââââââââââââââââââââââââââââââââââââââââââ */
export default function StartupLaunchDashboard() {
  const [data, setData] = useState(() => {
    const saved = loadState();
    if (saved && Array.isArray(saved.industryTasks)) {
      const m = { ...saved, selectedIndustry: "digital-marketplace", industryTasks: {} };
      Object.keys(INDUSTRIES).forEach(k => { m.industryTasks[k] = k === "digital-marketplace" ? saved.industryTasks : JSON.parse(JSON.stringify(INDUSTRIES[k].tasks)); });
      return m;
    }
    if (saved && saved.industryTasks && !Array.isArray(saved.industryTasks)) return saved;
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  });
  const [activeTab, setActiveTab] = useState("checklist");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetProgressConfirm, setShowResetProgressConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [criticalTitle, setCriticalTitle] = useState("{count} critical items need attention");
  const [headerTitle, setHeaderTitle] = useState("Startup Launch Dashboard");
  const [progressTitle, setProgressTitle] = useState("Overall Progress");
  const [progressSubtitle, setProgressSubtitle] = useState("Delaware C-Corp â Pre-Launch Checklist");

  const DEFAULT_MILESTONES = [
    { min: 0, emoji: "\u{1F331}", label: "Just getting started", gradFrom: "#78716C", gradTo: "#A8A29E" },
    { min: 25, emoji: "\u{1F4AA}", label: "Building momentum!", gradFrom: "#2563EB", gradTo: "#60A5FA" },
    { min: 50, emoji: "\u{26A1}", label: "Halfway!", gradFrom: "#7C3AED", gradTo: "#A78BFA" },
    { min: 75, emoji: "\u{1F525}", label: "Almost there!", gradFrom: "#EA580C", gradTo: "#FB923C" },
    { min: 100, emoji: "\u{1F680}", label: "Ready to launch!", gradFrom: "#059669", gradTo: "#34D399" },
  ];
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  const getMilestone = (p) => {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (p >= milestones[i].min) return milestones[i];
    }
    return milestones[0];
  };

  const updateMilestone = (idx, field, value) => {
    setMilestones(prev => {
      const n = [...prev];
      n[idx] = { ...n[idx], [field]: field === "min" ? Number(value) : value };
      return n;
    });
  };

  const sectionTexts = { headerTitle, criticalTitle, progressTitle, progressSubtitle };
  const handleTextChange = (key, value) => {
    if (key === "criticalTitle") setCriticalTitle(value);
    if (key === "headerTitle") setHeaderTitle(value);
    if (key === "progressTitle") setProgressTitle(value);
    if (key === "progressSubtitle") setProgressSubtitle(value);
  };

  /* Apply CSS variables on mount */
  useEffect(() => {
    Object.entries(THEME_DEFAULTS).forEach(([k, val]) => {
      document.documentElement.style.setProperty(k, val);
    });
  }, []);

  useEffect(() => { window.__dashboardState = data; }, [data]);

  const uid = () => `t_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

  /* ââ Checklist mutations ââ */
  const weekStatusChange = (weekId, taskId, newStatus) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (!w) return n;
      const t = w.tasks.find(t => t.id===taskId); if (t) t.status = newStatus;
      return n;
    });
  };

  const editWeekTask = (weekId, taskId, text, desc) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (!w) return n;
      const t = w.tasks.find(t => t.id===taskId); if (t){ t.text=text; t.description=desc; }
      return n;
    });
  };

  const deleteWeekTask = (weekId, taskId) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (w) w.tasks = w.tasks.filter(t => t.id!==taskId);
      return n;
    });
  };

  const addWeekTask = (weekId, text, desc) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (w) w.tasks.push({ id:uid(), text, description:desc, status:"pending", critical:false });
      return n;
    });
  };

  const toggleWeekCritical = (weekId, taskId) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (!w) return n;
      const t = w.tasks.find(t => t.id===taskId); if (t) t.critical = !t.critical;
      return n;
    });
  };

  const renameWeek = (weekId, title) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const w = n.weeks.find(w => w.id===weekId); if (w) w.title = title;
      return n;
    });
  };

  const deleteWeek = (weekId) => {
    setData(prev => { const n = JSON.parse(JSON.stringify(prev)); n.weeks = n.weeks.filter(w => w.id!==weekId); return n; });
  };

  const resetWeek = (weekId) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const defaultW = INITIAL_DATA.weeks.find(w => w.id === weekId);
      if (defaultW) {
        const idx = n.weeks.findIndex(w => w.id === weekId);
        if (idx !== -1) n.weeks[idx] = JSON.parse(JSON.stringify(defaultW));
      }
      return n;
    });
  };

  const addWeek = () => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n.weeks.push({ id:uid(), title:`Week ${n.weeks.length+1} â New Section`, tasks:[] });
      return n;
    });
  };

  /* ââ Industry mutations ââ */
  const industryStatusChange = (taskId, newStatus) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const tasks = n.industryTasks[n.selectedIndustry];
      if (tasks){ const t = tasks.find(t => t.id===taskId); if (t) t.status = newStatus; }
      return n;
    });
  };

  const editIndustryTask = (taskId, text, desc) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const tasks = n.industryTasks[n.selectedIndustry];
      if (tasks){ const t = tasks.find(t => t.id===taskId); if (t){ t.text=text; t.description=desc; } }
      return n;
    });
  };

  const deleteIndustryTask = (taskId) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const k = n.selectedIndustry;
      if (n.industryTasks[k]) n.industryTasks[k] = n.industryTasks[k].filter(t => t.id!==taskId);
      return n;
    });
  };

  const addIndustryTask = (text, desc, priority) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const k = n.selectedIndustry;
      if (!n.industryTasks[k]) n.industryTasks[k] = [];
      n.industryTasks[k].push({ id:uid(), text, description:desc, status:"pending", priority, critical:false });
      return n;
    });
  };

  const toggleIndustryCritical = (taskId) => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const tasks = n.industryTasks[n.selectedIndustry];
      if (tasks){ const t = tasks.find(t => t.id===taskId); if (t) t.critical = !t.critical; }
      return n;
    });
  };

  const resetIndustry = () => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev)); const k = n.selectedIndustry;
      if (INDUSTRIES[k]) n.industryTasks[k] = JSON.parse(JSON.stringify(INDUSTRIES[k].tasks));
      return n;
    });
  };

  const setSelectedIndustry = (key) => setData(prev => ({ ...prev, selectedIndustry: key }));
  const resetAll = () => {
    setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    setShowResetConfirm(false);
    // Also reset theme to defaults
    Object.entries(THEME_DEFAULTS).forEach(([k, val]) => {
      document.documentElement.style.setProperty(k, val);
    });
    // Signal the ThemeEditor to re-sync via a custom event
    window.dispatchEvent(new CustomEvent("theme-reset"));
  };

  const resetProgress = () => {
    setData(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n.weeks.forEach(w => { w.tasks.forEach(t => { t.status = "pending"; }); });
      Object.keys(n.industryTasks).forEach(k => { (n.industryTasks[k] || []).forEach(t => { t.status = "pending"; }); });
      return n;
    });
    setShowResetProgressConfirm(false);
  };

  const [showExportPreview, setShowExportPreview] = useState(false);
  const exportRef = useRef(null);

  const buildExportHTML = () => {
    const iKey = data.selectedIndustry;
    const iLabel = INDUSTRIES[iKey]?.label || iKey;
    const iTasks = data.industryTasks[iKey] || [];
    const all = [...data.weeks.flatMap(w => w.tasks), ...iTasks];
    const done = all.filter(t => t.status === "completed").length;
    const total = all.length;
    const pctVal = total === 0 ? 0 : Math.round((done / total) * 100);
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const checkbox = (s) => {
      if (s === "completed") return `<div class="chk chk-done">&#10003;</div>`;
      if (s === "in_progress") return `<div class="chk chk-prog">&#9679;</div>`;
      if (s === "blocked") return `<div class="chk chk-block">&#10007;</div>`;
      return `<div class="chk chk-pend"></div>`;
    };
    const statusLabel = (s) => STATUSES[s]?.label || s;
    const esc = (str) => String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    const taskRow = (t, extra = "") => {
      const crit = t.critical ? `<span class="crit-badge">CRITICAL</span>` : "";
      const hasDesc = t.description ? true : false;
      return `<tr class="${t.critical ? "crit-row" : ""}">
        <td class="icon-col">${checkbox(t.status)}</td>
        <td class="task-col"><span class="task-text">${esc(t.text)}</span>${extra}${crit}${hasDesc ? `<div class="task-desc">${esc(t.description)}</div>` : ""}</td>
        <td class="status-col ${t.status}"><span class="status-label">${statusLabel(t.status)}</span></td></tr>`;
    };

    const sectionBg = "#F9FAFB";
    let sections = "";
    for (const w of data.weeks) {
      const wDone = w.tasks.filter(t => t.status === "completed").length;
      sections += `<div class="section"><div class="section-hdr"><span class="section-title">${esc(w.title)}</span><span class="section-count">${wDone}/${w.tasks.length} completed</span></div>`;
      sections += `<table style="background:${sectionBg}"><tbody>`;
      for (const t of w.tasks) { sections += taskRow(t); }
      sections += `</tbody></table></div>`;
    }

    if (iTasks.length > 0) {
      const iDone = iTasks.filter(t => t.status === "completed").length;
      sections += `<div class="section"><div class="section-hdr"><span class="section-title">Industry: ${esc(iLabel)}</span><span class="section-count">${iDone}/${iTasks.length} completed</span></div>`;
      sections += `<table style="background:${sectionBg}"><tbody>`;
      for (const t of iTasks) {
        const pri = t.priority === "high" ? `<span class="pri-high">High</span>` : t.priority === "medium" ? `<span class="pri-med">Medium</span>` : "";
        sections += taskRow(t, pri);
      }
      sections += `</tbody></table></div>`;
    }

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Startup Launch Checklist</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;padding:40px 48px;max-width:900px;margin:0 auto;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #059669}
.header h1{font-size:24px;color:#059669;margin-bottom:4px}
.header .sub{font-size:13px;color:#6B7280}
.header .date{font-size:12px;color:#9CA3AF;margin-top:4px}
.progress-bar{margin:20px auto;max-width:400px}
.progress-outer{background:#E5E7EB;border-radius:99px;height:10px;overflow:hidden}
.progress-inner{background:linear-gradient(90deg,#047857,#10B981);height:100%;border-radius:99px;transition:width .3s}
.progress-label{text-align:center;margin-top:6px;font-size:13px;font-weight:600;color:#374151}
.section{margin-bottom:24px;break-inside:avoid}
.section-hdr{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#F0FDF4;border:1px solid #A7F3D0;border-radius:8px 8px 0 0}
.section-title{font-size:14px;font-weight:700;color:#065F46}
.section-count{font-size:12px;color:#6B7280;font-weight:500}
table{width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;overflow:hidden}
tr{border-bottom:1px solid #F3F4F6}
tr:last-child{border-bottom:none}
td{padding:10px 12px;font-size:13px}
.icon-col{width:28px;text-align:center;vertical-align:middle}
.task-col{line-height:1.5;vertical-align:middle}
.task-text{font-weight:500}
.task-desc{font-size:11px;color:#6B7280;margin-top:3px;line-height:1.4}
.status-col{width:90px;text-align:right;vertical-align:middle}
.status-label{font-size:11px;font-weight:600;white-space:nowrap}
.status-col.completed .status-label{color:#16A34A}
.status-col.in_progress .status-label{color:#2563EB}
.status-col.blocked .status-label{color:#DC2626}
.status-col.pending .status-label{color:#9CA3AF}
.chk{width:16px;height:16px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;line-height:1}
.chk-done{background:#DCFCE7;border:1.5px solid #16A34A;color:#16A34A}
.chk-prog{background:#DBEAFE;border:1.5px solid #2563EB;color:#2563EB;font-size:8px}
.chk-block{background:#FEE2E2;border:1.5px solid #DC2626;color:#DC2626}
.chk-pend{background:#F9FAFB;border:1.5px solid #D1D5DB}
.crit-row{background:#FFF5F5}
.crit-badge{display:inline-block;font-size:9px;font-weight:700;background:#DC2626;color:white;padding:1px 6px;border-radius:99px;margin-left:6px;vertical-align:middle}
.pri-high{display:inline-block;font-size:9px;font-weight:600;background:#FEF3C7;color:#92400E;padding:1px 6px;border-radius:99px;margin-left:6px;border:1px solid #FDE68A;vertical-align:middle}
.pri-med{display:inline-block;font-size:9px;font-weight:600;background:#DBEAFE;color:#1E40AF;padding:1px 6px;border-radius:99px;margin-left:6px;border:1px solid #BFDBFE;vertical-align:middle}
.footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF}
@media print{body{padding:24px 32px}button,.no-print{display:none!important}.section{break-inside:avoid}}
</style></head><body>
<div class="header"><h1>${esc(headerTitle)}</h1><p class="sub">${esc(progressSubtitle)}</p><p class="date">Exported on ${today}</p></div>
<div class="progress-bar"><div class="progress-outer"><div class="progress-inner" style="width:${pctVal}%"></div></div><div class="progress-label">${done} / ${total} tasks completed (${pctVal}%)</div></div>
${sections}
<div class="footer"><p>This checklist covers general startup structuring for Delaware C-Corps.</p><p>Always consult a lawyer and accountant for decisions specific to your situation.</p></div>
</body></html>`;
  };

  const exportPDF = () => { setShowExportPreview(true); };

  const [shareCopied, setShareCopied] = useState(false);
  const shareProgress = () => {
    try {
      const shareData = { d: data, m: milestones, t: { headerTitle, criticalTitle, progressTitle, progressSubtitle } };
      const json = JSON.stringify(shareData);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const url = window.location.origin + window.location.pathname + "#state=" + encoded;
      try { navigator.clipboard.writeText(url); } catch { /* fallback */ const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) { console.warn("Share failed:", e); }
  };

  // Restore state from URL hash on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#state=")) {
        const encoded = hash.slice(7);
        const json = decodeURIComponent(escape(atob(encoded)));
        const shareData = JSON.parse(json);
        if (shareData.d) setData(shareData.d);
        if (shareData.m) setMilestones(shareData.m);
        if (shareData.t) {
          if (shareData.t.headerTitle) setHeaderTitle(shareData.t.headerTitle);
          if (shareData.t.criticalTitle) setCriticalTitle(shareData.t.criticalTitle);
          if (shareData.t.progressTitle) setProgressTitle(shareData.t.progressTitle);
          if (shareData.t.progressSubtitle) setProgressSubtitle(shareData.t.progressSubtitle);
        }
        window.location.hash = "";
      }
    } catch (e) { console.warn("Failed to restore shared state:", e); }
  }, []);

  /* ââ Computed ââ */
  const curIndustry = data.industryTasks[data.selectedIndustry] || [];
  const allTasks = [...data.weeks.flatMap(w => w.tasks), ...curIndustry];
  const totalDone = allTasks.filter(t => t.status==="completed").length;
  const totalAll = allTasks.length;
  const pct = totalAll === 0 ? 0 : Math.round((totalDone/totalAll)*100);

  // Gather ALL critical items across both tabs
  const criticalItems = [];
  for (const w of data.weeks) {
    for (const t of w.tasks) {
      if (t.critical) criticalItems.push({ ...t, source: w.title });
    }
  }
  for (const t of curIndustry) {
    if (t.critical) criticalItems.push({ ...t, source: INDUSTRIES[data.selectedIndustry]?.label || "" });
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)", fontFamily:"var(--font-sans)" }}>
      <style>{`
        :root { ${Object.entries(THEME_DEFAULTS).map(([k,val]) => `${k}:${val}`).join("; ")}; }
        .act-btn { width:28px; height:28px; border-radius:var(--radius-sm); border:none; background:transparent; cursor:pointer; color:var(--color-text-light); display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .act-btn svg { pointer-events: none; }
        .act-btn.hover-edit:hover { background:var(--color-border-light); color:var(--color-text-secondary); }
        .act-btn.hover-delete:hover { background:var(--color-danger-light); color:var(--color-danger); }
        .act-btn.hover-flag:hover { background:var(--color-danger-light); color:var(--color-danger); }
        .act-btn.hover-unflag:hover { background:var(--color-border-light); color:var(--color-text-muted); }
        .act-btn.hover-reset:hover { background:var(--color-blue-bg); color:var(--color-blue); }
        .task-row:hover { background: var(--color-soft) !important; }
        .task-row.critical-row:hover { background: var(--color-danger-row) !important; }
        .week-header:hover { background: var(--color-soft) !important; }
        .header-btn { transition: all .15s; }
        .header-btn:hover { background: var(--color-border-light) !important; }
        .add-task-btn { transition: all .15s; }
        .add-task-btn:hover { background: var(--color-soft) !important; color: var(--color-accent) !important; }
        .add-section-btn { transition: all .15s; }
        .add-section-btn:hover { border-color: var(--color-primary) !important; color: var(--color-accent) !important; background: var(--color-soft) !important; }
        .ind-option:hover { background: var(--color-border-light) !important; }
        .ind-option.active:hover { background: var(--color-soft) !important; }
        .status-option:hover { background: var(--color-border-light) !important; }
        .reset-ind-btn { transition: all .15s; }
        .reset-ind-btn:hover { border-color: var(--color-blue) !important; color: var(--color-blue) !important; }
        .section-card > .week-header:first-child { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .section-card > :last-child { border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
        .section-card > .week-header:only-child { border-radius: var(--radius-lg); }
        .section-theme-btn:hover { background: var(--color-border-light) !important; color: var(--color-primary) !important; }
        .critical-title-editable:hover { border-bottom-color: var(--color-danger-text) !important; }
        .progress-theme-btn .section-theme-btn { color: rgba(255,255,255,0.6) !important; }
        .progress-theme-btn .section-theme-btn:hover { background: rgba(255,255,255,0.2) !important; color: white !important; }
        .header-theme-btn .section-theme-btn { color: rgba(255,255,255,0.6) !important; }
        .header-theme-btn .section-theme-btn:hover { background: rgba(255,255,255,0.2) !important; color: white !important; }
        .emoji-trigger:hover { transform: scale(1.2) !important; }
        .role-toggle:hover { border-color: var(--color-border-medium) !important; }
        .toolbar-tip-btn:hover { background: var(--color-soft) !important; color: var(--color-text-secondary) !important; border-color: var(--color-border-medium) !important; }
        .toolbar-tooltip { position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); background: var(--color-text); color: white; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 4px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 10; font-family: var(--font-sans); }
        .toolbar-tip-btn:hover .toolbar-tooltip { opacity: 1; }
        .toolbar-tooltip::before { content: ""; position: absolute; top: -4px; left: 50%; transform: translateX(-50%); border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 4px solid var(--color-text); }

        /* ââ Responsive ââ */
        @media (max-width: 768px) {
          .responsive-toolbar { flex-wrap: wrap; gap: 10px !important; justify-content: center !important; }
          .responsive-toolbar > div { flex: unset !important; }
          .responsive-header { padding: 0 20px !important; }
          .responsive-header h1 { font-size: 18px !important; }
          .responsive-header p { font-size: 12px !important; }
          .responsive-main { padding: 16px 14px 48px !important; }
          .responsive-progress { padding: 20px 18px !important; }
          .responsive-pct-big { font-size: 36px !important; }
          .responsive-tasks-big { font-size: 28px !important; }
          .responsive-tasks-sub { font-size: 15px !important; }
          .week-header { padding: 12px 14px !important; flex-wrap: wrap; gap: 8px; }
          .week-header-right { display: none !important; }
          .week-header-right-mobile { display: flex !important; }
          .task-row { padding: 10px 12px !important; }
          .task-row .task-actions { opacity: 1 !important; }
          .responsive-side-panel { width: 100% !important; max-width: 100% !important; }
          .responsive-side-panel.panel-closed { right: -110% !important; }
          .responsive-tab-btn { padding: 8px 8px !important; font-size: 12px !important; }
          .responsive-industry-row { flex-direction: column !important; }
          .responsive-industry-row > button { margin-bottom: 0 !important; }
          .responsive-legend { flex-direction: column !important; gap: 6px !important; }
          .responsive-rename-input { width: 100% !important; max-width: 200px !important; }
          .toolbar-tooltip { display: none; }
        }
        @media (max-width: 480px) {
          .responsive-header h1 { font-size: 16px !important; }
          .responsive-progress { padding: 16px 14px !important; }
          .responsive-pct-big { font-size: 28px !important; }
          .responsive-tasks-big { font-size: 22px !important; }
          .responsive-tasks-sub { font-size: 13px !important; }
          .responsive-main { padding: 12px 10px 40px !important; }
          .responsive-status-row { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .responsive-milestone { width: 100% !important; justify-content: flex-start !important; }
        }
      `}</style>

      {/* ââ Theme Editor (admin only) ââ */}
      {isAdmin && <ThemeEditor />}
      {isAdmin && <SectionEditorPanel texts={sectionTexts} onTextChange={handleTextChange} />}

      {/* ââ Header ââ */}
      <div style={{ background:"var(--color-header-bg)", padding:"28px 0", position:"relative" }}>
        {isAdmin && <div style={{ position:"absolute", top:8, right:8 }} className="header-theme-btn"><SectionThemeBtn sectionKey="header" visible={isAdmin} /></div>}
        <div className="responsive-header" style={{ textAlign:"center", padding:"0 48px" }}>
          <h1 contentEditable suppressContentEditableWarning
            onBlur={e => setHeaderTitle(e.currentTarget.textContent || headerTitle)}
            style={{ margin:0, fontSize:22, fontWeight:700, color:"var(--color-header-text)", outline:"none", cursor:"text" }}>
            {headerTitle}
          </h1>
          <p contentEditable suppressContentEditableWarning
            onBlur={e => setProgressSubtitle(e.currentTarget.textContent || progressSubtitle)}
            style={{ margin:"6px 0 0", fontSize:14, fontWeight:600, color:"var(--color-header-sub)", outline:"none", cursor:"text" }}>
            {progressSubtitle}
          </p>
        </div>
      </div>
      {/* ââ Toolbar ââ */}
      <div style={{ background:"var(--color-border-light)", borderBottom:"1px solid var(--color-border)", padding:"12px 0" }}>
        <div className="responsive-toolbar" style={{ maxWidth:860, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Admin / User toggle â left */}
          <div style={{ flex:"1 1 0", display:"flex" }}>
            <div className="role-toggle" onClick={() => setIsAdmin(!isAdmin)}
              title={isAdmin ? "Switch to User view" : "Switch to Admin view"}
              style={{ display:"flex", alignItems:"center", cursor:"pointer", background:"var(--color-surface)", borderRadius:99, padding:2, border:"1px solid var(--color-border)", userSelect:"none", fontFamily:"var(--font-sans)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:600, transition:"all .25s", background: !isAdmin ? "var(--color-text)" : "transparent", color: !isAdmin ? "white" : "var(--color-text-light)", boxShadow: !isAdmin ? "0 1px 3px rgba(0,0,0,.1)" : "none" }}>
                <UserSvg /> User
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:600, transition:"all .25s", background: isAdmin ? "var(--color-primary)" : "transparent", color: isAdmin ? "white" : "var(--color-text-light)", boxShadow: isAdmin ? "0 1px 3px rgba(0,0,0,.15)" : "none" }}>
                <ShieldSvg /> Admin
              </div>
            </div>
          </div>
          {/* Reset + Share + Export icon buttons â right */}
          <div style={{ flex:"1 1 0", display:"flex", justifyContent:"flex-end", gap:6 }}>
            {isAdmin ? (
              <button onClick={() => setShowResetConfirm(true)} className="toolbar-tip-btn"
                style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", transition:"all .15s" }}>
                <ResetSvg />
                <span className="toolbar-tooltip">Reset All</span>
              </button>
            ) : (
              <button onClick={() => setShowResetProgressConfirm(true)} className="toolbar-tip-btn"
                style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", transition:"all .15s" }}>
                <ResetSvg />
                <span className="toolbar-tooltip">Reset Progress</span>
              </button>
            )}
            <button onClick={shareProgress} className="toolbar-tip-btn"
              style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, background: shareCopied ? "var(--color-success-bg)" : "var(--color-surface)", color: shareCopied ? "var(--color-success)" : "var(--color-text-muted)", border: shareCopied ? "1px solid var(--color-success)" : "1px solid var(--color-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", transition:"all .2s" }}>
              <ShareSvg />
              <span className="toolbar-tooltip">{shareCopied ? "Copied!" : "Share"}</span>
            </button>
            <button onClick={exportPDF} className="toolbar-tip-btn"
              style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", transition:"all .15s" }}>
              <ExportSvg />
              <span className="toolbar-tooltip">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ââ Reset modal ââ */}
      {showResetConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"var(--color-surface)", borderRadius:"var(--radius-lg)", padding:24, maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
            <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:"var(--color-text)", fontFamily:"var(--font-sans)" }}>Reset everything?</h3>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"var(--color-text-muted)", fontFamily:"var(--font-sans)" }}>This will restore all weeks, tasks, and industry selections to their original defaults. This cannot be undone.</p>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ padding:"8px 16px", fontSize:13, fontWeight:500, background:"var(--color-surface)", color:"var(--color-text-secondary)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Cancel</button>
              <button onClick={resetAll} style={{ padding:"8px 16px", fontSize:13, fontWeight:700, background:"var(--color-danger)", color:"white", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* ââ Reset Progress modal (user mode) ââ */}
      {showResetProgressConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"var(--color-surface)", borderRadius:"var(--radius-lg)", padding:24, maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
            <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:600, color:"var(--color-text)", fontFamily:"var(--font-sans)" }}>Reset your progress?</h3>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"var(--color-text-muted)", fontFamily:"var(--font-sans)" }}>This will set all task statuses back to Pending. Your task names, descriptions, and sections will stay the same. This cannot be undone.</p>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={() => setShowResetProgressConfirm(false)} style={{ padding:"8px 16px", fontSize:13, fontWeight:500, background:"var(--color-surface)", color:"var(--color-text-secondary)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Cancel</button>
              <button onClick={resetProgress} style={{ padding:"8px 16px", fontSize:13, fontWeight:600, background:"var(--color-danger)", color:"white", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Reset Progress</button>
            </div>
          </div>
        </div>
      )}

      {/* ââ Emoji Milestone Panel ââ */}
      {showEmojiPanel && (
        <div className="responsive-side-panel" style={{ position:"fixed", top:0, right:0, bottom:0, width:340, background:"var(--color-surface)", boxShadow:"-4px 0 24px rgba(0,0,0,.12)", zIndex:998, display:"flex", flexDirection:"column", fontFamily:"var(--font-sans)", borderLeft:"1px solid var(--color-border)" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--color-border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--color-text)" }}>Milestone Emojis</h3>
              <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--color-text-muted)" }}>Customize emojis and labels for each progress level</p>
            </div>
            <button onClick={() => setShowEmojiPanel(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--color-text-muted)", padding:4, lineHeight:1 }}>&times;</button>
          </div>
          <div style={{ flex:1, overflow:"auto", padding:"16px 20px" }}>
            {milestones.map((m, idx) => (
              <div key={idx} style={{ marginBottom:16, padding:14, background:"var(--color-border-light)", borderRadius:"var(--radius-md)", border:"1px solid var(--color-border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{m.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--color-text-secondary)" }}>{m.min === 100 ? "100%" : `${m.min}% â ${(milestones[idx+1]?.min || 100) - 1}%`}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-muted)", display:"block", marginBottom:3 }}>Emoji</label>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:28, lineHeight:1 }}>{m.emoji}</span>
                      <span style={{ fontSize:11, color:"var(--color-text-muted)" }}>Tap to pick:</span>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {["\u{1F331}","\u{1F4AA}","\u{26A1}","\u{1F525}","\u{1F680}","\u{2B50}","\u{1F389}","\u{1F3AF}","\u{1F4A1}","\u{1F4A5}","\u{1F48E}","\u{1F3C6}","\u{2705}","\u{1F4CA}","\u{1F6A7}","\u{1F4DD}","\u{1F9E0}","\u{2764}","\u{1F44D}","\u{1F60E}","\u{1F64C}","\u{1F30D}","\u{1F308}","\u{1F40D}"].map(em => (
                        <button key={em} onClick={() => updateMilestone(idx, "emoji", em)}
                          style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border: m.emoji === em ? "2px solid var(--color-primary)" : "1px solid var(--color-border)", borderRadius:"var(--radius-sm)", background: m.emoji === em ? "var(--color-soft)" : "var(--color-surface)", cursor:"pointer", transition:"all .12s" }}
                          className="header-btn">
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-muted)", display:"block", marginBottom:3 }}>Label</label>
                    <input value={m.label} onChange={e => updateMilestone(idx, "label", e.target.value)}
                      style={{ width:"100%", padding:"6px 10px", fontSize:13, border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", background:"var(--color-surface)", color:"var(--color-text)", outline:"none", fontFamily:"var(--font-sans)", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-muted)", display:"block", marginBottom:3 }}>Starts at %</label>
                    <input type="number" min={0} max={100} value={m.min} onChange={e => updateMilestone(idx, "min", e.target.value)}
                      style={{ width:"100%", padding:"6px 10px", fontSize:13, border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", background:"var(--color-surface)", color:"var(--color-text)", outline:"none", fontFamily:"var(--font-sans)", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-muted)", display:"block", marginBottom:3 }}>Card Gradient</label>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input type="color" value={m.gradFrom} onChange={e => updateMilestone(idx, "gradFrom", e.target.value.toUpperCase())}
                        style={{ width:30, height:24, border:"1px solid var(--color-border-medium)", borderRadius:4, cursor:"pointer", padding:1, flex:"0 0 30px" }} />
                      <div style={{ flex:1, height:20, borderRadius:4, background:`linear-gradient(90deg, ${m.gradFrom}, ${m.gradTo})`, border:"1px solid var(--color-border-medium)" }} />
                      <input type="color" value={m.gradTo} onChange={e => updateMilestone(idx, "gradTo", e.target.value.toUpperCase())}
                        style={{ width:30, height:24, border:"1px solid var(--color-border-medium)", borderRadius:4, cursor:"pointer", padding:1, flex:"0 0 30px" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setMilestones(DEFAULT_MILESTONES)}
              className="header-btn"
              style={{ width:"100%", padding:"8px 14px", fontSize:12, fontWeight:500, background:"var(--color-surface)", color:"var(--color-text-muted)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-sans)", marginTop:4 }}>
              <ResetSvg /> Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ââ Export PDF preview ââ */}
      {showExportPreview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", flexDirection:"column", zIndex:999 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", background:"#1F2937" }}>
            <span style={{ color:"white", fontSize:14, fontWeight:600 }}>PDF Preview â Use your browser's Print (Ctrl+P / Cmd+P) to save as PDF</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { if (exportRef.current) { exportRef.current.contentWindow.print(); } }}
                style={{ padding:"6px 16px", fontSize:13, fontWeight:500, background:"#059669", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>Print / Save PDF</button>
              <button onClick={() => setShowExportPreview(false)}
                style={{ padding:"6px 16px", fontSize:13, fontWeight:500, background:"#374151", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>Close</button>
            </div>
          </div>
          <iframe ref={exportRef} srcDoc={buildExportHTML()} style={{ flex:1, border:"none", background:"white" }} />
        </div>
      )}

      <div className="responsive-main" style={{ maxWidth:860, margin:"0 auto", padding:"24px 24px 60px" }}>
        {/* ââ Progress card ââ */}
        <div className="responsive-progress" style={{ background:`linear-gradient(135deg, ${getMilestone(pct).gradFrom} 0%, ${getMilestone(pct).gradTo} 100%)`, borderRadius:"var(--radius-xl)", padding:"24px 28px", marginBottom:24, color:"white", position:"relative", transition:"background .5s ease" }}>
          {isAdmin && <div style={{ position:"absolute", top:12, right:12 }} className="progress-theme-btn"><SectionThemeBtn sectionKey="progress" visible={isAdmin} /></div>}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:8 }}>
            <div>
              <p style={{ margin:0, fontSize:13, opacity:.85, fontWeight:500 }}>{progressTitle}</p>
              <p className="responsive-tasks-big" style={{ margin:"4px 0 0", fontSize:36, fontWeight:700, lineHeight:1 }}>{totalDone} <span className="responsive-tasks-sub" style={{ fontSize:18, fontWeight:400, opacity:.7 }}>/ {totalAll} tasks</span></p>
            </div>
            <p className="responsive-pct-big" style={{ margin:0, fontSize:48, fontWeight:700, lineHeight:1 }}>{pct}%</p>
          </div>
          <div style={{ marginTop:16, height:6, background:"rgba(255,255,255,.25)", borderRadius:99 }}>
            <div style={{ width:`${pct}%`, height:"100%", background:"white", borderRadius:99, transition:"width .4s ease" }} />
          </div>
          {/* Status summary + motivational label */}
          <div className="responsive-status-row" style={{ marginTop:12, display:"flex", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", flex:1 }}>
              {STATUS_ORDER.map(key => {
                const count = allTasks.filter(t => t.status===key).length;
                if (count === 0 && key !== "pending") return null;
                const st = STATUSES[key];
                return (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:99, background:"white", opacity: 0.7 }} />
                    <span style={{ fontSize:12, opacity:.85 }}>{count} {st.label}</span>
                  </div>
                );
              })}
            </div>
            <span onClick={isAdmin ? () => setShowEmojiPanel(true) : undefined}
              title={isAdmin ? "Click to customize milestone emojis" : undefined}
              className={`responsive-milestone ${isAdmin ? "emoji-trigger" : ""}`}
              style={{ fontSize:12, opacity:1, fontWeight:600, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:8, cursor: isAdmin ? "pointer" : "default", transition:"transform .15s" }}>
              {getMilestone(pct).label} <span style={{ fontSize:16 }}>{getMilestone(pct).emoji}</span>
            </span>
          </div>
        </div>

        {/* ââ Critical panel ââ */}
        <CriticalPanel items={criticalItems} title={criticalTitle} onTitleChange={setCriticalTitle} isAdmin={isAdmin} />

        {/* ââ Tabs ââ */}
        <div style={{ display:"flex", gap:8, marginBottom:20, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, flex:1, background:"var(--color-border-light)", borderRadius:"var(--radius-md)", padding:4 }}>
            {[{ id:"checklist", label:"Launch Checklist" },{ id:"industry", label:"Industry-Specific Checklist" }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="responsive-tab-btn"
                style={{ flex:1, padding:"10px 16px", fontSize:13, fontWeight:600, border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", background: activeTab===tab.id ? "var(--color-surface)" : "transparent", color: activeTab===tab.id ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: activeTab===tab.id ? "0 1px 3px rgba(0,0,0,.08)" : "none", transition:"all .15s", fontFamily:"var(--font-sans)" }}>
                {tab.label}
              </button>
            ))}
          </div>
          {isAdmin && <SectionThemeBtn sectionKey="status" />}
        </div>

        {/* ââ Checklist tab ââ */}
        {activeTab === "checklist" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {data.weeks.map((week, i) => (
              <WeekSection key={week.id} week={week}
                defaultWeek={INITIAL_DATA.weeks.find(w => w.id === week.id)}
                onStatusChange={weekStatusChange} onEditTask={editWeekTask} onDeleteTask={deleteWeekTask} onAddTask={addWeekTask}
                onRenameWeek={renameWeek} onDeleteWeek={deleteWeek} onResetWeek={resetWeek} onToggleCritical={toggleWeekCritical}
                defaultOpen={i===0} isAdmin={isAdmin} />
            ))}
            <button onClick={addWeek} title="Create a new week or custom section with its own tasks"
              className="add-section-btn"
              style={{ width:"100%", padding:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"var(--color-surface)", border:"2px dashed var(--color-border-medium)", borderRadius:"var(--radius-lg)", cursor:"pointer", color:"var(--color-text-light)", fontSize:14, fontWeight:600, transition:"all .15s", fontFamily:"var(--font-sans)" }}>
              <Plus /> Add new section
            </button>
          </div>
        )}

        {/* ââ Industry tab ââ */}
        {activeTab === "industry" && (
          <div>
            <div className="responsive-industry-row" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:0 }}>
              <div style={{ flex:1 }}><IndustryDropdown selected={data.selectedIndustry} onChange={setSelectedIndustry} /></div>
              <button onClick={resetIndustry} title="Reset this industry to defaults"
                className="reset-ind-btn"
                style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:6, background:"var(--color-surface)", border:"1px solid var(--color-border-medium)", borderRadius:"var(--radius-md)", cursor:"pointer", fontSize:13, fontWeight:500, color:"var(--color-text-muted)", marginBottom:16, transition:"all .15s", whiteSpace:"nowrap", fontFamily:"var(--font-sans)" }}>
                <ResetSvg /> Reset to default
              </button>
            </div>
            <div style={{ background:"var(--color-warning-bg)", border:"1px solid var(--color-warning-border)", borderRadius:"var(--radius-md)", padding:"14px 18px", marginBottom:16, position:"relative" }}>
              {isAdmin && <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:2 }}>
                <SectionThemeBtn sectionKey="industry" />
                <SectionThemeBtn sectionKey="priority" />
              </div>}
              <p style={{ margin:"0 0 10px", fontSize:13, color:"var(--color-warning-text)", lineHeight:1.6, paddingRight:60 }}>{INDUSTRIES[data.selectedIndustry]?.description}</p>
              <div className="responsive-legend" style={{ display:"flex", gap:16, flexWrap:"wrap", paddingTop:8, borderTop:"1px solid var(--color-warning-border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:"var(--color-danger)", color:"white" }}>CRITICAL</span>
                  <span style={{ fontSize:12, color:"var(--color-warning-text)" }}>Must resolve before launch</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:PRI.high.bg, color:PRI.high.text, border:`1px solid ${PRI.high.border}` }}>High Priority</span>
                  <span style={{ fontSize:12, color:"var(--color-warning-text)" }}>Should be done before launch</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:PRI.medium.bg, color:PRI.medium.text, border:`1px solid ${PRI.medium.border}` }}>Medium Priority</span>
                  <span style={{ fontSize:12, color:"var(--color-warning-text)" }}>Important but won't block launch</span>
                </div>
              </div>
            </div>
            {curIndustry.length > 0 && <div style={{ marginBottom:16, padding:"0 4px" }}><ProgressBar completed={curIndustry.filter(t => t.status==="completed").length} total={curIndustry.length} /></div>}
            <div className="section-card" style={{ background:"var(--color-surface)", borderRadius:"var(--radius-lg)", border:"1px solid var(--color-border)", boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
              {curIndustry.map(task => (
                <TaskRow key={task.id} task={task} onStatusChange={(id,s) => industryStatusChange(id,s)} onEdit={editIndustryTask} onDelete={deleteIndustryTask} onToggleCritical={toggleIndustryCritical} />
              ))}
              <AddTaskRow onAdd={addIndustryTask} showPriority={true} />
            </div>
          </div>
        )}

        {/* ââ Footer ââ */}
        <div style={{ textAlign:"center", marginTop:40, fontSize:12, color:"var(--color-text-light)" }}>
          <p style={{ margin:0 }}>This checklist covers general startup structuring for Delaware C-Corps.<br />Always consult a lawyer and accountant for decisions specific to your situation.</p>
        </div>
      </div>
    </div>
  );
}
