import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

const EmptyStateIllustration = ({ theme }) => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-6"
  >
    <circle cx="60" cy="60" r="50" className={theme === 'dark' ? 'fill-slate-800' : 'fill-slate-100'} />
    <circle cx="60" cy="60" r="35" className={theme === 'dark' ? 'fill-slate-700' : 'fill-slate-200'} />
    <path
      d="M45 55C45 52.2386 47.2386 50 50 50H70C72.7614 50 75 52.2386 75 55V65C75 67.7614 72.7614 70 70 70H50C47.2386 70 45 67.7614 45 65V55Z"
      className={theme === 'dark' ? 'fill-slate-600' : 'fill-slate-300'}
    />
    <circle cx="52" cy="58" r="3" className={theme === 'dark' ? 'fill-slate-400' : 'fill-slate-400'} />
    <circle cx="68" cy="58" r="3" className={theme === 'dark' ? 'fill-slate-400' : 'fill-slate-400'} />
    <path
      d="M55 66C55 66 58 69 60 69C62 69 65 66 65 66"
      stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  theme = 'dark',
  className = ''
}) => {
  const isDark = theme === 'dark';

  const IconComponent = icon && LucideIcons[icon.charAt(0).toUpperCase() + icon.slice(1)]
    ? LucideIcons[icon.charAt(0).toUpperCase() + icon.slice(1)]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-2xl p-8 text-center
        ${isDark
          ? 'bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 border border-white/10'
          : 'bg-gradient-to-br from-slate-100/50 via-slate-50/50 to-slate-100/50 border border-slate-200'
        }
        ${className}
      `}
    >
      <div
        className={`absolute inset-0 opacity-30 ${
          isDark
            ? 'bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10'
            : 'bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5'
        }`}
      />

      <div className="relative z-10 flex flex-col items-center">
        {IconComponent ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`mb-4 p-4 rounded-full ${
              isDark ? 'bg-white/10' : 'bg-slate-200/50'
            }`}
          >
            <IconComponent
              size={48}
              className={isDark ? 'text-cyan-400' : 'text-cyan-600'}
              strokeWidth={1.5}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EmptyStateIllustration theme={theme} />
          </motion.div>
        )}

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`text-sm mb-6 max-w-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {description}
        </motion.p>

        {action && actionLabel && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            onClick={action}
            className={`
              px-6 py-3 rounded-xl font-semibold text-sm
              transition-all duration-200 active:scale-95
              ${isDark
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300 shadow-lg shadow-cyan-500/25'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
              }
            `}
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
