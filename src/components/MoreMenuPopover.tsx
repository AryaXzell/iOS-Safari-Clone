import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'motion/react';
import { Share, Copy, BookOpen, PlusSquare, ArrowUpRight, Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import type { ReactNode } from 'react';

export function MoreMenuPopover({ 
  open, 
  onOpenChange, 
  onAddBookmark,
  onAddReadingList,
  sortOrder,
  onSortChange,
  currentUrl,
  children 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  onAddBookmark: () => void,
  onAddReadingList: () => void,
  sortOrder: string,
  onSortChange: (sort: string) => void,
  currentUrl: string | null,
  children: ReactNode 
}) {
  // To perfectly replicate iOS Popover animations, we use AnimatePresence.
  // Radix Popover.Content allows forced mount, then animate.
  
  const [activeMenu, setActiveMenu] = useState<'main' | 'sort'>('main');

  const handleShare = async () => {
    if (!currentUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ url: currentUrl });
      } catch (err) {
        console.error(err);
      }
    } else {
      window.open(currentUrl, '_blank');
    }
    onOpenChange(false);
  };

  const handleOpenNewWindow = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank');
      onOpenChange(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={(o) => { onOpenChange(o); if(!o) setTimeout(() => setActiveMenu('main'), 300); }}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      
      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content 
              sideOffset={10} 
              side="top"
              align="end"
              className="z-50 w-[250px] outline-none"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bg-white/75 dark:bg-[#1C1C1E]/75 backdrop-blur-2xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative"
              >
                <AnimatePresence initial={false} mode="wait">
                  {activeMenu === 'main' && (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col py-1"
                    >
                      <MenuButton icon={<Share size={20} className="font-light" />} label="Share..." disabled={!currentUrl} onClick={handleShare} />
                      <MenuButton icon={<PlusSquare size={20} />} label="Add Bookmark" disabled={!currentUrl} onClick={() => { onAddBookmark(); onOpenChange(false); }} />
                      <MenuButton icon={<BookOpen size={20} />} label="Add to Reading List" disabled={!currentUrl} onClick={() => { onAddReadingList(); onOpenChange(false); }} />
                      <div className="h-[0.5px] bg-gray-300 dark:bg-gray-700 my-1 mx-4" />
                      <MenuButton icon={<ArrowUpRight size={20} />} label="Open in New Tab" disabled={!currentUrl} onClick={handleOpenNewWindow} />
                      <MenuButton icon={<ArrowUpRight size={20} />} label="Sort By" hasArrow onClick={() => setActiveMenu('sort')} />
                    </motion.div>
                  )}
                  {activeMenu === 'sort' && (
                    <motion.div
                      key="sort"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col py-1"
                    >
                      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-300 dark:border-gray-700 mb-1">
                         <button onClick={() => setActiveMenu('main')} className="text-ios-blue active:opacity-50 text-[15px]">Back</button>
                         <span className="text-[13px] font-semibold tracking-wide text-gray-500 uppercase">Sort By</span>
                         <div className="w-8" />
                      </div>
                      <MenuButton label="Favorites" isActive={sortOrder === 'favorites'} onClick={() => { onSortChange('favorites'); onOpenChange(false); }} />
                      <MenuButton label="Title" isActive={sortOrder === 'title'} onClick={() => { onSortChange('title'); onOpenChange(false); }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}

function MenuButton({ label, icon, isActive, hasArrow, disabled, onClick }: { label: string, icon?: ReactNode, isActive?: boolean, hasArrow?: boolean, disabled?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("w-full flex items-center justify-between px-4 py-2.5 active:bg-gray-200/50 dark:active:bg-gray-800/50 transition-colors", disabled ? "opacity-50" : "")}>
      <div className="flex items-center space-x-3 text-black dark:text-white">
        {isActive !== undefined && (
          <div className="w-5 flex justify-center text-ios-blue">
            {isActive && <Check size={18} strokeWidth={2.5} />}
          </div>
        )}
        <span className="text-[17px] -tracking-[0.41px] leading-5">{label}</span>
      </div>
      {(icon || hasArrow) && (
        <div className="text-black dark:text-white ml-4 flex items-center">
           {icon}
           {hasArrow && <ChevronRight size={18} className="text-gray-400 ml-1" />}
        </div>
      )}
    </button>
  );
}
