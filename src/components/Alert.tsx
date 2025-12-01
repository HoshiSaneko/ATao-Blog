import { Info, CheckCircle, XCircle, AlertTriangle, Star } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ type, title, children }) => {
  const config = {
    info: {
      icon: Star,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-900 dark:text-blue-200',
      iconColor: 'text-blue-700 dark:text-blue-400',
      defaultLabel: '注意',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-900 dark:text-emerald-200',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      defaultLabel: '成功',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-700 dark:text-amber-400',
      defaultLabel: '警告',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-900 dark:text-red-200',
      iconColor: 'text-red-700 dark:text-red-400',
      defaultLabel: '错误',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];
  // Only show title if it's explicitly provided via ["title"] syntax
  // If title is undefined (no []), don't show any title

  return (
    <div className={`my-6 p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor} flex gap-3 items-start`}>
      <Icon size={18} className={`${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 text-sm leading-relaxed font-sans">
        {title !== undefined && title && (
          <span className="font-semibold mr-2">{title}</span>
        )}
        <div className="[&>p]:mb-0 [&>p:last-child]:mb-0 [&>*]:mb-0 [&>*:last-child]:mb-0 [&>p:last-child]:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Alert;

