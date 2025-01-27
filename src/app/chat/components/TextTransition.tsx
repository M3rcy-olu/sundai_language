"use client";

import { motion } from "framer-motion";

const TextTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: 0.5, duration: 0.4, ease: [0.27, 0.01, 0, 0.99] }}
    >
      {children}
    </motion.div>
  );
};

export default TextTransition;
