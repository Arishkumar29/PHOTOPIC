import { motion } from 'motion/react';

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, scale: 0.98, filter: 'blur(4px)' }
};

export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}
