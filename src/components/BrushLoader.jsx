import React from 'react';
import { motion } from 'framer-motion';

export function BrushLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* 
        This SVG represents a minimal, curved brush stroke.
        We use stroke-dasharray and framer-motion to animate it "painting" onto the screen. 
      */}
      <svg 
        width="120" 
        height="40" 
        viewBox="0 0 120 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-ochre"
      >
        <motion.path
          d="M 10,20 Q 30,5 60,20 T 110,20"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.2
          }}
        />
      </svg>
      <motion.p 
        className="mt-3 text-[0.65rem] tracking-[0.2em] font-sans font-bold uppercase text-charcoal/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
      >
        Loading
      </motion.p>
    </div>
  );
}
