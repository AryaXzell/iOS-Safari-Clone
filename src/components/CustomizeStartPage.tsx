import { BottomSheet } from './BottomSheet';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

export type StartPageConfig = {
  favorites: boolean;
  frequentlyVisited: boolean;
  sharedWithYou: boolean;
  privacyReport: boolean;
  siriSuggestions: boolean;
  readingList: boolean;
  recentlyClosedTabs: boolean;
};

export function CustomizeStartPage({ 
  isOpen, 
  onClose,
  config,
  onConfigChange
}: { 
  isOpen: boolean; 
  onClose: () => void;
  config: StartPageConfig;
  onConfigChange: (config: StartPageConfig) => void;
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-[#F2F2F7] dark:bg-[#000000]">
      <div className="flex items-center justify-between px-4 pb-2 border-b border-ios-separator dark:border-ios-separator-dark">
        <div className="w-8" />
        <Dialog.Title className="text-[17px] font-semibold tracking-tight text-center">
          Customize Start Page
        </Dialog.Title>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 active:opacity-60"
        >
          <X size={20} strokeWidth={2.5}/>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-64 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col pt-4 items-center">
             <div className="w-3/4 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4" />
             <div className="w-full px-4 grid grid-cols-4 gap-2">
               {[1,2,3,4,5,6,7,8].map(i => (
                 <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md" />
               ))}
             </div>
             <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 dark:from-black/90 to-transparent backdrop-blur-[2px]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm">
          <ToggleRow label="Favorites" checked={config.favorites} onChange={(v) => onConfigChange({...config, favorites: v})} />
          <ToggleRow label="Frequently Visited" checked={config.frequentlyVisited} onChange={(v) => onConfigChange({...config, frequentlyVisited: v})} hasSeparator />
          <ToggleRow label="Shared with You" checked={config.sharedWithYou} onChange={(v) => onConfigChange({...config, sharedWithYou: v})} hasSeparator />
          <ToggleRow label="Privacy Report" checked={config.privacyReport} onChange={(v) => onConfigChange({...config, privacyReport: v})} hasSeparator />
          <ToggleRow label="Siri Suggestions" checked={config.siriSuggestions} onChange={(v) => onConfigChange({...config, siriSuggestions: v})} hasSeparator />
          <ToggleRow label="Reading List" checked={config.readingList} onChange={(v) => onConfigChange({...config, readingList: v})} hasSeparator />
          <ToggleRow label="Recently Closed Tabs" checked={config.recentlyClosedTabs} onChange={(v) => onConfigChange({...config, recentlyClosedTabs: v})} hasSeparator />
        </div>
      </div>
    </BottomSheet>
  );
}

function ToggleRow({ label, checked, onChange, hasSeparator = false }: { label: string, checked: boolean, onChange: (val: boolean) => void, hasSeparator?: boolean }) {
  return (
    <div className="relative flex items-center justify-between bg-white dark:bg-[#1C1C1E] px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
      {hasSeparator && <div className="absolute top-0 left-4 right-0 h-[1px] bg-ios-separator dark:bg-ios-separator-dark" />}
      <span className="text-[17px] -tracking-[0.41px]">{label}</span>
      <IosSwitch checked={checked} onChange={onChange} />
    </div>
  )
}

function IosSwitch({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[51px] h-[31px] rounded-full transition-colors duration-300 ease-in-out",
        checked ? "bg-[#34C759]" : "bg-[#E5E5EA] dark:bg-[#39393D]"
      )}
    >
      <motion.div
        initial={false}
        animate={{
          x: checked ? 22 : 2,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
      />
    </button>
  );
}
