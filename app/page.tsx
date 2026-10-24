import Link from "next/link";
import { Compass, BookOpen, Palette, CheckCircle2, ArrowRight } from 'lucide-react';
import hero_bg from '../assets/hero_back.svg';
import {
  NavigateLearningSvg,
  CuratedResourcesSvg,
  ThemesFeatureSvg,
} from '@/components/home/feature-illustrations';

export default function IndexPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-950 bg-cover md:py-16 lg:py-24 min-w-screen tails-bg transition-colors">
        <div className="flex flex-col-reverse items-center justify-center p-10 mx-auto lg:flex-row lg:max-w-6xl lg:p-0">
          <div className="container relative z-20 flex flex-col w-full px-5 pr-12 mb-16 text-2xl text-gray-700 dark:text-slate-300 lg:w-1/2 sm:px-0 md:px-10 sm:items-center lg:items-start lg:mb-0">
            <h1 className="relative z-20 font-sans text-4xl font-extrabold leading-none text-black dark:text-white sm:text-5xl xl:text-6xl sm:text-center lg:text-left">
              <span className="relative">
                <span className="absolute bottom-0 left-0 inline-block w-full h-4 mb-1 -ml-1 transform -skew-x-3 bg-hero"></span>
                <span className="relative">Your Learning Journey with,</span>
              </span>
              <span className="relative block text-hero">roadmapXpress.</span>
            </h1>
            <p className="relative z-20 block mt-6 text-base text-gray-500 dark:text-slate-400 xl:text-lg sm:text-center lg:text-left">
              Begin your learning path with roadmapXpress!  It'll guide you through any topic, providing free resources every step of the way.
            </p>

            {/* Two Roadmap Links in Top Section */}
            <div className="relative flex flex-wrap items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
              <Link
                href="/roadmap/backend"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Backend Roadmap</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/roadmap/frontend"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Frontend Roadmap</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative w-full px-8 mb-12 rounded-lg cursor-pointer md:px-0 lg:mb-0 lg:pl-10 md:w-2/3 lg:w-1/2 group">
            <div className="relative rounded-md">
              <img src={hero_bg.src} className="z-10 object-cover w-full h-full" alt="Hero background" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="w-full bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 py-16 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Features & Tools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Everything You Need to Master Any Topic
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Step-by-step guidance from basic syntax to production architecture, with curated free resources and customizable visual themes.
            </p>
          </div>

          <div className="space-y-20 sm:space-y-28">
            {/* Feature 1: Navigate Learning with Vector SVG */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 p-2 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 sm:p-3">
                    <NavigateLearningSvg className="transition-transform duration-300 group-hover:scale-[1.01]" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Structured Curriculum</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                  Navigate Learning Step-by-Step
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                  Start learning with confidence. Follow clear, logical paths that take you smoothly from fundamental concepts to advanced real-world patterns without feeling overwhelmed.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Visual dependency maps showing which topics to master first</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Track progress seamlessly: mark topics as Done, Learning, or Skip</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Structured stages for clear milestones and goal accomplishment</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Curated Resources with Vector SVG (Reversed Layout) */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 p-2 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 sm:p-3">
                    <CuratedResourcesSvg className="transition-transform duration-300 group-hover:scale-[1.01]" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 mb-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Free Content & Docs</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                  Curated Resources on Every Topic
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                  Stop wasting hours scouring search engines for high quality tutorials. Click on any topic to slide out hand-picked documentation, videos, cheatsheets, and interactive guides.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Tagged requirements: Recommended, Alternative, or Optional</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>100% free community-vetted resources with zero paywalls</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Look and Feel with Vector SVG */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 p-2 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 sm:p-3">
                    <ThemesFeatureSvg className="transition-transform duration-300 group-hover:scale-[1.01]" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 mb-3">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Personalized Styling</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                  Handwritten Style with 7 Presets
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                  Customize the look and feel to match your mood and focus. Switch between authentic handwritten sketch styling, modern clean palettes, or sleek high-contrast dark mode.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>7 lightweight presets: Minimal Slate, Nordic Sage, Ocean Breeze & more</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Authentic architectural sketch font styling with Virgil typography</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Automatic day & night adaptive contrast for comfortable reading</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <p className="text-sm">&copy; 2026 roadmapXpress. All rights reserved.</p>
      </footer>
    </>
  );
}
