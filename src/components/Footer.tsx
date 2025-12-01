import { ICP_INFO } from '../config';

export default function Footer() {
  return (
    <footer className="mt-auto pb-10 text-center text-xs text-slate-400 dark:text-slate-500">
      <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent mb-8"></div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-slate-400/80 dark:text-slate-500">
        <span>
          © {new Date().getFullYear()} T-Blog 主题 · 基于 Astro & Tailwind 构建
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {ICP_INFO.icp}
        </a>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <a
          href="/rss.xml"
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="RSS 订阅"
        >
          RSS订阅
        </a>
      </div>
    </footer>
  );
}

