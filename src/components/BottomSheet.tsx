import { motion, AnimatePresence, useDragControls, PanInfo } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = ['90%'],
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: string[];
  className?: string;
}) {
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/40 z-40 dark:bg-black/60"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 1,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.8 }}
                onDragEnd={handleDragEnd}
                className={cn(
                  "fixed bottom-0 left-0 right-0 z-50 h-[90vh] bg-ios-bg dark:bg-ios-bg-dark rounded-t-[24px] shadow-2xl flex flex-col focus:outline-none overflow-hidden",
                  className
                )}
              >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none">
                  <div className="w-9 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
