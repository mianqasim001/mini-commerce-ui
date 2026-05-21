import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable button component.
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 */
export function Button({
  children, variant = 'primary', disabled, loading, className = '', ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3 text-sm tracking-widest uppercase font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-2';

  const variants = {
    primary:   'bg-cobalt text-white hover:bg-cobalt-dark disabled:opacity-50',
    secondary: 'border border-cobalt text-cobalt hover:bg-cobalt-light disabled:opacity-50',
    danger:    'bg-cadmium text-white hover:bg-cadmium-dark disabled:opacity-50',
    ghost:     'text-charcoal hover:bg-cream disabled:opacity-50',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
