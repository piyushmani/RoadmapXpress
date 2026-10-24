import React from 'react';

/**
 * Scalable SVG illustration for the "Navigate Learning" feature.
 * Renders an interactive-style developer roadmap graph with milestones,
 * road-track spine, and status badges in full vector format.
 */
export function NavigateLearningSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto select-none ${className}`}
      aria-label="Navigate Learning Roadmap Diagram"
    >
      <defs>
        <pattern id="grid-pattern-1" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-slate-300/60 dark:fill-slate-700/60" />
        </pattern>
        <linearGradient id="spine-grad-1" x1="60" y1="40" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Card Canvas */}
      <rect width="540" height="360" rx="16" className="fill-white dark:fill-slate-900" />
      <rect width="540" height="360" rx="16" fill="url(#grid-pattern-1)" />

      {/* Main Roadmap Spine Track */}
      <path
        d="M 90 85 C 190 85, 190 180, 270 180 C 350 180, 350 275, 450 275"
        stroke="url(#spine-grad-1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />

      {/* Milestone 1: Fundamentals (Done) */}
      <g transform="translate(45, 52)">
        <rect
          width="155"
          height="66"
          rx="10"
          className="fill-emerald-50 dark:fill-emerald-950/70 stroke-emerald-500 dark:stroke-emerald-500"
          strokeWidth="1.5"
        />
        <rect x="12" y="14" width="20" height="20" rx="5" className="fill-emerald-500" />
        <text x="22" y="28" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
          ✓
        </text>
        <text x="40" y="29" className="fill-emerald-950 dark:fill-emerald-200" fontSize="13" fontWeight="700">
          Internet & HTTP
        </text>
        <text x="14" y="50" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11" fontWeight="500">
          Status: Completed
        </text>
      </g>

      {/* Connecting Badge */}
      <g transform="translate(182, 148)">
        <circle cx="16" cy="16" r="14" className="fill-sky-500 text-white" />
        <text x="16" y="21" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
          2
        </text>
      </g>

      {/* Topic Box: In Progress (Learning) */}
      <g transform="translate(216, 142)">
        <rect
          width="168"
          height="76"
          rx="10"
          className="fill-purple-50 dark:fill-purple-950/70 stroke-purple-500 dark:stroke-purple-500"
          strokeWidth="2"
        />
        <rect x="12" y="10" width="84" height="18" rx="4" className="fill-purple-200 dark:fill-purple-900" />
        <text x="54" y="23" textAnchor="middle" className="fill-purple-900 dark:fill-purple-200" fontSize="10" fontWeight="700">
          IN PROGRESS
        </text>
        <text x="12" y="46" className="fill-purple-950 dark:fill-purple-100" fontSize="13" fontWeight="700">
          REST & GraphQL APIs
        </text>
        <text x="12" y="62" className="fill-purple-700 dark:fill-purple-300" fontSize="11">
          Backend Protocols
        </text>
      </g>

      {/* Subtopic Branch */}
      <path
        d="M 384 180 C 430 180, 430 125, 460 125"
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <g transform="translate(420, 106)">
        <rect
          width="96"
          height="38"
          rx="6"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="1"
        />
        <text x="48" y="24" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300" fontSize="11" fontWeight="600">
          Postman Tool
        </text>
      </g>

      {/* Milestone 3: Advanced DB (Recommended) */}
      <g transform="translate(330, 242)">
        <rect
          width="175"
          height="72"
          rx="10"
          className="fill-amber-50 dark:fill-amber-950/70 stroke-amber-500 dark:stroke-amber-500"
          strokeWidth="1.5"
        />
        <rect x="12" y="10" width="88" height="18" rx="4" className="fill-amber-200 dark:fill-amber-900" />
        <text x="56" y="23" textAnchor="middle" className="fill-amber-900 dark:fill-amber-200" fontSize="10" fontWeight="700">
          RECOMMENDED
        </text>
        <text x="12" y="46" className="fill-amber-950 dark:fill-amber-100" fontSize="13" fontWeight="700">
          PostgreSQL & Redis
        </text>
        <text x="12" y="63" className="fill-amber-700 dark:fill-amber-300" fontSize="11">
          Relational & In-Memory
        </text>
      </g>

      {/* Floating Progress Pill */}
      <g transform="translate(365, 18)">
        <rect width="145" height="34" rx="17" className="fill-slate-900 dark:fill-slate-800 shadow-md" />
        <circle cx="20" cy="17" r="5" fill="#10b981" />
        <text x="80" y="22" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600">
          85% Completed
        </text>
      </g>
    </svg>
  );
}

/**
 * Scalable SVG illustration for the "Curated Resources" feature.
 * Renders a slide-out topic resource drawer with vetted documentation,
 * video tutorials, and sandbox badges.
 */
export function CuratedResourcesSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto select-none ${className}`}
      aria-label="Curated Topic Learning Resources"
    >
      <defs>
        <pattern id="grid-pattern-2" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-slate-300/60 dark:fill-slate-700/60" />
        </pattern>
      </defs>

      {/* Card Canvas */}
      <rect width="540" height="360" rx="16" className="fill-white dark:fill-slate-900" />
      <rect width="540" height="360" rx="16" fill="url(#grid-pattern-2)" />

      {/* Drawer Header */}
      <g transform="translate(30, 22)">
        <rect
          width="480"
          height="48"
          rx="10"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />
        <rect x="14" y="14" width="70" height="20" rx="4" className="fill-blue-100 dark:fill-blue-900" />
        <text x="49" y="28" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300" fontSize="10" fontWeight="700">
          BACKEND
        </text>
        <text x="96" y="30" className="fill-slate-900 dark:fill-slate-100" fontSize="14" fontWeight="700">
          Authentication & JWT
        </text>
        <rect x="375" y="14" width="90" height="20" rx="4" className="fill-slate-200 dark:fill-slate-700" />
        <text x="420" y="28" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300" fontSize="10" fontWeight="600">
          ID: auth-jwt
        </text>
      </g>

      {/* Resource 1: Official Documentation */}
      <g transform="translate(30, 86)">
        <rect
          width="480"
          height="72"
          rx="10"
          className="fill-slate-50 dark:fill-slate-800/60 stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />
        <rect
          x="16"
          y="16"
          width="40"
          height="40"
          rx="8"
          className="fill-emerald-100 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800"
          strokeWidth="1"
        />
        <text x="36" y="41" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="18" fontWeight="bold">
          📖
        </text>
        <text x="70" y="34" className="fill-slate-900 dark:fill-slate-100" fontSize="14" fontWeight="700">
          OAuth 2.0 & OpenID Connect Spec
        </text>
        <text x="70" y="52" className="fill-slate-500 dark:fill-slate-400" fontSize="11">
          Official RFC 6749 Specification & Best Practices
        </text>
        <rect x="390" y="25" width="76" height="24" rx="6" className="fill-emerald-500" />
        <text x="428" y="41" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
          Free Doc
        </text>
      </g>

      {/* Resource 2: Video Walkthrough */}
      <g transform="translate(30, 174)">
        <rect
          width="480"
          height="72"
          rx="10"
          className="fill-slate-50 dark:fill-slate-800/60 stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />
        <rect
          x="16"
          y="16"
          width="40"
          height="40"
          rx="8"
          className="fill-purple-100 dark:fill-purple-950 stroke-purple-300 dark:stroke-purple-800"
          strokeWidth="1"
        />
        <text x="36" y="41" textAnchor="middle" className="fill-purple-700 dark:fill-purple-400" fontSize="18" fontWeight="bold">
          ▶
        </text>
        <text x="70" y="34" className="fill-slate-900 dark:fill-slate-100" fontSize="14" fontWeight="700">
          JWT Token Security & Refresh Patterns
        </text>
        <text x="70" y="52" className="fill-slate-500 dark:fill-slate-400" fontSize="11">
          Full Video Guide · Access Tokens & HTTP-Only Cookies
        </text>
        <rect x="390" y="25" width="76" height="24" rx="6" className="fill-purple-600" />
        <text x="428" y="41" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
          Free Video
        </text>
      </g>

      {/* Resource 3: Interactive Sandbox */}
      <g transform="translate(30, 262)">
        <rect
          width="480"
          height="72"
          rx="10"
          className="fill-slate-50 dark:fill-slate-800/60 stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />
        <rect
          x="16"
          y="16"
          width="40"
          height="40"
          rx="8"
          className="fill-amber-100 dark:fill-amber-950 stroke-amber-300 dark:stroke-amber-800"
          strokeWidth="1"
        />
        <text x="36" y="41" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400" fontSize="15" fontWeight="bold">
          &lt;/&gt;
        </text>
        <text x="70" y="34" className="fill-slate-900 dark:fill-slate-100" fontSize="14" fontWeight="700">
          Interactive JWT Debugger & Playpen
        </text>
        <text x="70" y="52" className="fill-slate-500 dark:fill-slate-400" fontSize="11">
          Inspect header, payload claims and HMAC-SHA256 signatures
        </text>
        <rect x="390" y="25" width="76" height="24" rx="6" className="fill-amber-600" />
        <text x="428" y="41" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
          Hands-On
        </text>
      </g>
    </svg>
  );
}

/**
 * Scalable SVG illustration for the "Look and Feel" feature.
 * Renders the 7 preset theme switchers and a split-view comparison
 * of Handwritten Sketch mode and Midnight Pro dark mode.
 */
export function ThemesFeatureSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto select-none ${className}`}
      aria-label="Handwritten and Modern Themes Switcher"
    >
      <defs>
        <pattern id="grid-pattern-3" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-slate-300/60 dark:fill-slate-700/60" />
        </pattern>
      </defs>

      {/* Card Canvas */}
      <rect width="540" height="360" rx="16" className="fill-white dark:fill-slate-900" />
      <rect width="540" height="360" rx="16" fill="url(#grid-pattern-3)" />

      {/* Preset Pills Selector Header */}
      <g transform="translate(30, 22)">
        <rect
          width="480"
          height="44"
          rx="10"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />

        {/* Preset Pill 1: Minimal */}
        <g transform="translate(12, 8)">
          <rect
            width="88"
            height="28"
            rx="6"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1"
          />
          <circle cx="16" cy="14" r="5" fill="#0ea5e9" />
          <text x="49" y="18" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200" fontSize="10" fontWeight="600">
            Minimal
          </text>
        </g>

        {/* Preset Pill 2: Honey */}
        <g transform="translate(108, 8)">
          <rect
            width="82"
            height="28"
            rx="6"
            className="fill-amber-100 dark:fill-amber-950/80 stroke-amber-400 dark:stroke-amber-600"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="14" r="5" fill="#f59e0b" />
          <text x="46" y="18" textAnchor="middle" className="fill-amber-900 dark:fill-amber-200" fontSize="10" fontWeight="700">
            Honey
          </text>
        </g>

        {/* Preset Pill 3: Sage */}
        <g transform="translate(198, 8)">
          <rect
            width="82"
            height="28"
            rx="6"
            className="fill-emerald-100 dark:fill-emerald-950/80 stroke-emerald-400 dark:stroke-emerald-600"
            strokeWidth="1"
          />
          <circle cx="16" cy="14" r="5" fill="#10b981" />
          <text x="46" y="18" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-200" fontSize="10" fontWeight="600">
            Sage
          </text>
        </g>

        {/* Preset Pill 4: Midnight Pro */}
        <g transform="translate(288, 8)">
          <rect
            width="96"
            height="28"
            rx="6"
            className="fill-slate-900 dark:fill-slate-950 stroke-sky-400"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="14" r="5" fill="#38bdf8" />
          <text x="53" y="18" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
            Midnight
          </text>
        </g>

        {/* Preset Pill 5: Sketch */}
        <g transform="translate(392, 8)">
          <rect
            width="76"
            height="28"
            rx="6"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text x="38" y="18" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300" fontSize="10" fontWeight="600">
            Sketch
          </text>
        </g>
      </g>

      {/* Left: Paper & Ink Sketch Preview */}
      <g transform="translate(30, 86)">
        <rect
          width="230"
          height="244"
          rx="12"
          className="fill-amber-50/50 dark:fill-slate-950 stroke-slate-800 dark:stroke-slate-400"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <text x="115" y="32" textAnchor="middle" className="fill-slate-900 dark:fill-white font-serif" fontSize="13" fontWeight="bold">
          ✏️ Paper & Ink (Sketch)
        </text>

        {/* Sketch Box 1 */}
        <g transform="translate(25, 52)">
          <rect
            width="180"
            height="50"
            rx="4"
            className="fill-yellow-100 dark:fill-slate-900 stroke-slate-900 dark:stroke-slate-200"
            strokeWidth="2"
          />
          <text x="90" y="30" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="13" fontWeight="bold">
            Microservices
          </text>
        </g>

        {/* Sketch Arrow Line */}
        <path d="M 115 104 L 115 144" className="stroke-slate-900 dark:stroke-slate-200" strokeWidth="2.5" strokeDasharray="3 3" />

        {/* Sketch Box 2 */}
        <g transform="translate(25, 146)">
          <rect
            width="180"
            height="50"
            rx="4"
            className="fill-white dark:fill-slate-800 stroke-slate-800 dark:stroke-slate-300"
            strokeWidth="1.8"
          />
          <text x="90" y="30" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200" fontSize="12" fontWeight="600">
            Event Sourcing
          </text>
        </g>

        <text x="115" y="224" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="11" fontStyle="italic">
          Architects Daughter Font
        </text>
      </g>

      {/* Right: Midnight Pro Dark Preview */}
      <g transform="translate(280, 86)">
        <rect width="230" height="244" rx="12" className="fill-slate-950 stroke-slate-800" strokeWidth="2" />
        <text x="115" y="32" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">
          🌌 Midnight Pro
        </text>

        {/* Dark Node 1 */}
        <g transform="translate(25, 52)">
          <rect width="180" height="50" rx="8" fill="#131c2e" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="90" y="30" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
            API Gateway
          </text>
        </g>

        {/* Road Track Line */}
        <path d="M 115 104 L 115 144" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

        {/* Dark Node 2 */}
        <g transform="translate(25, 146)">
          <rect width="180" height="50" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
          <text x="90" y="30" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="600">
            Rate Limiting & Auth
          </text>
        </g>

        <text x="115" y="224" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Sleek High Contrast
        </text>
      </g>
    </svg>
  );
}
