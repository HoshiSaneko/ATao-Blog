// ============================================
// 基础信息配置
// ============================================
export const BLOG_NAME = "ATao";
export const SITE_DESCRIPTION = "做自己喜欢的事";

// ============================================
// 首页配置
// ============================================
export const HOME_PAGE = {
  // 诗句或名言
  verse: "路漫漫其修远兮，\n吾将上下而求索。",
  // 出处
  source: "屈原《离骚》",
  // 是否显示粒子背景
  showParticles: true,
  // 是否显示标签筛选
  showTagFilters: true,
  // 每页显示的文章数量（0 表示显示全部）
  postsPerPage: 5,
};

// ============================================
// 导航栏配置
// ============================================
export const NAVBAR = {
  // 导航链接
  links: [
    { label: '首页', href: '/' },
    { label: '归档', href: '/archive' },
    { label: '友链', href: '/link' },
    { label: '开往', href: 'https://www.travellings.cn/go.html', target: '_blank' },
    { label: '关于', href: '/about' },
  ],
  // Logo 文字（如果为空则只显示图标）
  logoText: "Blog",
  // Logo 图标文字（单个字符）
  logoIcon: "T",
  // 是否显示搜索功能
  showSearch: true,
  // 是否显示主题切换(暂时关闭)
  showThemeToggle: false,
  // 导航栏背景透明度（0-1）
  backgroundOpacity: 0.8,
  // 是否启用毛玻璃效果
  enableBackdropBlur: true,
};

// ============================================
// 主题配置 - 颜色
// ============================================
export const THEME_COLORS = {
  // 浅色主题
  light: {
    background: '#FAFBFC',
    paper: '#FFFFFF',
    text: '#1F2937',
    accent: '#4285F4',
    muted: '#6B7280',
    // 渐变背景
    gradient: {
      from: '#FAFBFC',
      to: '#F5F7FA',
    },
  },
  // 深色主题
  dark: {
    background: '#0A0B0E',
    paper: '#131418',
    text: '#E5E7EB',
    accent: '#60A5FA',
    muted: '#9CA3AF',
    // 渐变背景
    gradient: {
      from: '#0A0B0E',
      to: '#0D0E12',
    },
  },
};

// ============================================
// 排版配置 - 阅读体验
// ============================================
export const TYPOGRAPHY = {
  // 内容区域最大宽度（px）
  contentMaxWidth: 1280, // 对应 Tailwind 的 max-w-5xl
  // 文章内容区域最大宽度（px，更窄以优化阅读）
  articleMaxWidth: 768,
  // 行高
  lineHeight: {
    // 正文行高
    body: 1.75,
    // 标题行高
    heading: 1.2,
    // 紧凑行高（列表等）
    tight: 1.5,
  },
  // 字间距
  letterSpacing: {
    // 正文
    body: 'normal',
    // 标题
    heading: '-0.02em',
    // 小标题
    subheading: '0.01em',
  },
  // 段落间距（倍数，相对于字体大小）
  paragraphSpacing: 2,
  // 标题间距
  headingSpacing: {
    // 标题上方间距（倍数）
    top: 3,
    // 标题下方间距（倍数）
    bottom: 1.5,
  },
};

// ============================================
// 动画配置
// ============================================
export const ANIMATIONS = {
  // 页面过渡动画时长（ms）
  pageTransition: 500,
  // 悬停动画时长（ms）
  hoverTransition: 200,
  // 淡入动画时长（ms）
  fadeInDuration: 700,
  // 是否启用动画
  enabled: true,
  // 动画缓动函数
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'ease-in-out',
  },
};

// ============================================
// 间距配置
// ============================================
export const SPACING = {
  // 页面内边距
  pagePadding: {
    mobile: '1rem',    // px-4
    tablet: '1.5rem',  // sm:px-6
    desktop: '2rem',   // lg:px-8
  },
  // 内容区域顶部间距
  contentTopPadding: {
    mobile: '2rem',    // pt-8
    tablet: '3rem',    // sm:pt-12
  },
  // 组件间距
  componentGap: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    xlarge: '3rem',
  },
};

// ============================================
// 文章卡片配置
// ============================================
export const POST_CARD = {
  // 是否显示悬停效果
  enableHoverEffect: true,
  // 悬停时的缩放比例
  hoverScale: 1.02,
  // 最大显示标签数量
  maxVisibleTags: 3,
  // 摘要最大行数
  summaryMaxLines: 2,
  // 圆角大小
  borderRadius: '4px', // rounded-[4px]
  // 内边距
  padding: {
    mobile: '1.25rem',  // p-5
    desktop: '1.25rem', // p-5
  },
};

// ============================================
// 作者信息配置
// ============================================
export const AUTHOR_PROFILE = {
  name: "ATao",
  role: "自动化开发工程师",
  avatar: "https://cdn.atao.cyou/Web/Avatar.png",
  // 博客内容描述（支持 HTML 标签设置颜色）
  // 使用与金色主题协调的暖色调
  blogContent: "主要分享<span class=\"text-[#8c6b3f] dark:text-[#d3bc8e] font-semibold\">经验分享</span>、<span class=\"text-[#a38753] dark:text-[#d3bc8e] font-semibold\">代码</span>和<span class=\"text-[#be9f65] dark:text-[#d3bc8e] font-semibold\">Minecraft</span>相关的内容。涵盖AI、Docker、WPF、Python、Android等技术领域，以及一些实用的工具和技巧。",
  // 社交链接
  socialLinks: [
    {
      name: "gitHub",
      icon: "mdi:github",
      url: "https://github.com/ataoyan"
    },
    {
      name: "bilibili",
      icon: "ri:bilibili-fill",
      url: "https://space.bilibili.com/291198772"
    },
    {
      name: "tiktok",
      icon: "lineicons:tiktok",
      url: "", // 抖音不需要URL，使用 douyinId
      douyinId: "71134083952" // 抖音号，点击后复制
    },
    {
      name: "wechat",
      icon: "mdi:wechat",
      url: "", // 微信不需要URL，hover时显示二维码
      wechatQR: "https://cdn.atao.cyou/Web/wechat.jpg" // 微信二维码图片URL
    },
    {
      name: "email",
      icon: "carbon:email",
      url: "mailto:qiatao0305@163.com"
    },
  ],
  // 技能标签分类
  skills: {
    // 编程语言
    programmingLanguages: ["Python", "C#", "Java", "C++"],
    // 开发框架
    frameworks: ["PyQt", "QT", "WPF", "UIAutomator", "Selenium"],
    // 开发工具
    tools: ["ADB", "Git", "Docker", "Visual Studio", "Visual Studio Code", "Android Studio"]
  },
  // 位置信息（可选）
  location: "Ningbo, China",
  // MBTI
  mbti: "INTJ",
  // 出生年份（用于计算年龄和Lv等级）
  birthYear: 1999
};

// ============================================
// 版权声明配置
// ============================================
export const LICENSE_CONFIG = {
  // 是否启用版权声明
  enable: true,
  // 许可协议名称
  name: "CC BY-NC-SA 4.0",
  // 许可协议链接
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  // 许可协议文本
  text: "本博客所有文章除特别声明外，均采用 CC BY-NC-SA 4.0 许可协议, 转载请注明出处。",
  // 是否显示原创徽章
  showOriginalBadge: true,
};

// ============================================
// 备案信息配置
// ============================================
export const ICP_INFO = {
  // 备案号
  icp: "浙ICP备2024096834号-3",
};

// ============================================
// 功能开关配置
// ============================================
export const FEATURES = {
  // 是否启用粒子背景
  particles: true,
  // 是否启用阅读进度条
  readingProgress: true,
  // 是否启用目录
  tableOfContents: true,
  // 是否启用返回顶部按钮
  scrollToTop: true,
  // 是否启用分享按钮
  shareButtons: true,
};

// ============================================
// 评论系统配置
// ============================================
export const TWIKOO = {
  // Twikoo 环境 ID (自建时填写地址)
  envId: 'https://twikoo.taonotespace.com',
};

// ============================================
// 友链申请配置
// ============================================
export const FRIEND_LINK_CONTACT = {
  // 申请友链的联系邮箱
  email: 'qiatao0305@163.com',
  // 本站名称
  name: 'ATao-Blog',
  // 本站地址
  url: 'https://blog.atao.cyou/',
  // 本站描述
  description: '做自己喜欢的事',
  // 本站头像
  avatar: 'https://cdn.atao.cyou/Web/Avatar.png',
};
