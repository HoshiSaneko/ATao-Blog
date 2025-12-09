import {
    Sparkles, Sprout, Leaf, Flower,
    Feather, Wind, Cloud, Droplets,
    Snowflake, Mountain, Shield, Flame,
    Sun, Zap, Crown, Ghost
} from 'lucide-react';

export const DISCONNECTED_LEVEL = {
    days: 0,
    level: 0,
    title: '失联',
    Icon: Ghost,
    theme: 'text-gray-400 dark:text-gray-500',
    color: 'text-gray-400 dark:text-gray-500',
    border: 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
};

// 15级友链等级配置 - 每一级都有独特的配色
export const FRIEND_LEVELS = [
    {
        days: 30, level: 1, title: '初遇', Icon: Sparkles,
        theme: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800 group-hover:border-slate-400 dark:group-hover:border-slate-600',
        color: 'text-slate-600 dark:text-slate-400'
    },
    {
        days: 60, level: 2, title: '萌芽', Icon: Sprout,
        theme: 'text-lime-600 dark:text-lime-400',
        border: 'border-lime-200 dark:border-lime-800 group-hover:border-lime-400 dark:group-hover:border-lime-600',
        color: 'text-lime-600 dark:text-lime-400'
    },
    {
        days: 90, level: 3, title: '抽叶', Icon: Leaf,
        theme: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800 group-hover:border-green-400 dark:group-hover:border-green-600',
        color: 'text-green-600 dark:text-green-400'
    },
    {
        days: 180, level: 4, title: '绽放', Icon: Flower,
        theme: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800 group-hover:border-emerald-400 dark:group-hover:border-emerald-600',
        color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        days: 270, level: 5, title: '轻语', Icon: Feather,
        theme: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800 group-hover:border-teal-400 dark:group-hover:border-teal-600',
        color: 'text-teal-600 dark:text-teal-400'
    },
    {
        days: 365, level: 6, title: '听风', Icon: Wind,
        theme: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800 group-hover:border-cyan-400 dark:group-hover:border-cyan-600',
        color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
        days: 450, level: 7, title: '云游', Icon: Cloud,
        theme: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800 group-hover:border-sky-400 dark:group-hover:border-sky-600',
        color: 'text-sky-600 dark:text-sky-400'
    },
    {
        days: 540, level: 8, title: '润泽', Icon: Droplets,
        theme: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800 group-hover:border-blue-400 dark:group-hover:border-blue-600',
        color: 'text-blue-600 dark:text-blue-400'
    },
    {
        days: 630, level: 9, title: '凝冰', Icon: Snowflake,
        theme: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-600',
        color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
        days: 730, level: 10, title: '磐石', Icon: Mountain,
        theme: 'text-stone-600 dark:text-stone-400',
        border: 'border-stone-200 dark:border-stone-800 group-hover:border-stone-400 dark:group-hover:border-stone-600',
        color: 'text-stone-600 dark:text-stone-400'
    },
    {
        days: 900, level: 11, title: '坚守', Icon: Shield,
        theme: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800 group-hover:border-amber-400 dark:group-hover:border-amber-600',
        color: 'text-amber-600 dark:text-amber-400'
    },
    {
        days: 1080, level: 12, title: '燃情', Icon: Flame,
        theme: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800 group-hover:border-orange-400 dark:group-hover:border-orange-600',
        color: 'text-orange-600 dark:text-orange-400'
    },
    {
        days: 1460, level: 13, title: '烈阳', Icon: Sun,
        theme: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800 group-hover:border-red-400 dark:group-hover:border-red-600',
        color: 'text-red-600 dark:text-red-400'
    },
    {
        days: 1825, level: 14, title: '雷鸣', Icon: Zap,
        theme: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800 group-hover:border-purple-400 dark:group-hover:border-purple-600',
        color: 'text-purple-600 dark:text-purple-400'
    },
    {
        days: 2190, level: 15, title: '传世', Icon: Crown,
        theme: 'text-fuchsia-600 dark:text-fuchsia-400',
        border: 'border-fuchsia-200 dark:border-fuchsia-800 group-hover:border-fuchsia-400 dark:group-hover:border-fuchsia-600',
        color: 'text-fuchsia-600 dark:text-fuchsia-400'
    },
];
