import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookmarksSheet, type BookmarkItem, type FolderItem } from './BookmarksSheet';
import { CustomizeStartPage, type StartPageConfig } from './CustomizeStartPage';
import { MoreMenuPopover } from './MoreMenuPopover';
import { ChevronLeft, ChevronRight, Book, Plus, Copy, Settings, LayoutGrid, MoreHorizontal, Lock, X, RotateCw, Shield, Clock, BookOpen, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Global mock state for bookmarks
const initialBookmarks: BookmarkItem[] = [
  { id: '1', title: 'Apple', url: 'https://www.apple.com', category: 'favorites' },
  { id: '2', title: 'Google', url: 'https://www.google.com/webhp?igu=1', category: 'favorites' },
  { id: '3', title: 'Wikipedia', url: 'https://en.wikipedia.org', category: 'favorites' },
  { id: '4', title: 'React', url: 'https://react.dev', category: 'favorites' },
  { id: '5', title: 'Tailwind CSS', url: 'https://tailwindcss.com', category: 'recently_saved' },
  { id: '6', title: 'Framer Motion', url: 'https://motion.dev', category: 'recently_saved' },
];

const initialFolders: FolderItem[] = [
  { id: 'f1', name: 'Work' },
  { id: 'f2', name: 'Personal' },
];

export function BrowserLayout() {
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Data State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);
  const [sortOrder, setSortOrder] = useState<string>('favorites');

  // Start Page Config
  const [startPageConfig, setStartPageConfig] = useState<StartPageConfig>({
    favorites: true,
    frequentlyVisited: true,
    sharedWithYou: true,
    privacyReport: false,
    siriSuggestions: true,
    readingList: false,
    recentlyClosedTabs: true
  });

  type TabData = {
    id: string;
    history: string[];
    currentIndex: number;
    searchQuery: string;
    iframeKey: number;
  };

  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', history: [], currentIndex: -1, searchQuery: '', iframeKey: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [isTabsViewOpen, setIsTabsViewOpen] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const history = activeTab.history;
  const currentIndex = activeTab.currentIndex;
  const searchQuery = activeTab.searchQuery;
  const iframeKey = activeTab.iframeKey;

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentUrl = currentIndex >= 0 ? history[currentIndex] : null;

  const updateActiveTab = (updates: Partial<TabData>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setProgress(0.1);
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 0.8) return p;
          return p + Math.random() * 0.1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleIframeLoad = () => {
    setProgress(1);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 400); // Wait for transition
  };

  const navigateTo = (url: string) => {
    setIsLoading(true);
    setProgress(0);
    setIsTabsViewOpen(false);
    
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newHistory = t.history.slice(0, t.currentIndex + 1);
        newHistory.push(url);
        return {
          ...t,
          history: newHistory,
          currentIndex: newHistory.length - 1,
          searchQuery: url
        };
      }
      return t;
    }));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    let url = searchQuery.trim();
    if (!url) return;
    
    // Simple heuristic for URL vs search
    if (/^https?:\/\//i.test(url) || /^localhost:/i.test(url)) {
      if (!url.startsWith('http')) url = 'https://' + url;
    } else if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      // Use google search with igu=1 to bypass simple iframe restrictions
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
    }

    // Attempt to bypass google's iframe restrictions
    if (url.match(/google\.[a-z]{2,}/) && !url.includes('igu=')) {
       url += url.includes('?') ? '&igu=1' : '?igu=1';
    }

    navigateTo(url);
    
    // Close keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setIsLoading(true);
      updateActiveTab({ 
        currentIndex: currentIndex - 1, 
        searchQuery: history[currentIndex - 1] 
      });
    } else if (currentIndex === 0) {
      updateActiveTab({ currentIndex: -1, searchQuery: '' });
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setIsLoading(true);
      updateActiveTab({ 
        currentIndex: currentIndex + 1, 
        searchQuery: history[currentIndex + 1] 
      });
    }
  };

  const reload = () => {
    setIsLoading(true);
    updateActiveTab({ iframeKey: iframeKey + 1 });
  };

  const addNewTab = () => {
    const newId = Date.now().toString();
    setTabs(prev => [...prev, { id: newId, history: [], currentIndex: -1, searchQuery: '', iframeKey: 0 }]);
    setActiveTabId(newId);
    setIsTabsViewOpen(false);
  };

  const closeTab = (id: string, e: any) => {
    e.stopPropagation();
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (remaining.length === 0) {
        const newId = Date.now().toString();
        setActiveTabId(newId);
        return [{ id: newId, history: [], currentIndex: -1, searchQuery: '', iframeKey: 0 }];
      }
      if (id === activeTabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-ios-bg dark:bg-[#000000] relative overflow-hidden font-sans text-ios-text dark:text-white">
      {/* Search Bar / Top Nav area */}
      <div className="w-full mt-12 px-4 z-40 relative">
        <form onSubmit={handleSearch} className="relative overflow-hidden w-full max-w-[600px] mx-auto bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md h-[46px] rounded-[12px] shadow-sm flex items-center px-4 border border-gray-200/50 dark:border-gray-800/50 transition-all focus-within:ring-2 ring-ios-blue">
           <div className="w-5 flex justify-center text-gray-400 mr-2">
             {currentUrl ? <Lock size={14} className="opacity-90" /> : <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
           </div>
           <input
             value={searchQuery}
             onChange={(e) => updateActiveTab({ searchQuery: e.target.value })}
             placeholder="Search or enter website name"
             className="flex-1 bg-transparent border-none outline-none text-[17px] -tracking-[0.41px] text-black dark:text-white font-medium"
           />
           {searchQuery && (
             <button type="button" onClick={() => updateActiveTab({ searchQuery: '' })} className="p-1 active:opacity-50">
               <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                 <X size={12} strokeWidth={3} className="text-white dark:text-gray-900" />
               </div>
             </button>
           )}
           {currentUrl && !searchQuery && (
             <button type="button" onClick={reload} className="p-1 ml-1 active:opacity-50 text-gray-400 z-10">
               <RotateCw size={16} strokeWidth={2.5} />
             </button>
           )}
           {/* Progress bar */}
           <div className="absolute bottom-0 left-0 h-[2px] bg-ios-blue transition-all duration-300 ease-out pointer-events-none" style={{ width: `${progress * 100}%`, opacity: isLoading ? 1 : 0 }} />
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden w-full relative z-0">
        {!currentUrl ? (
          <div className="h-full overflow-y-auto w-full max-w-[600px] mx-auto px-4 pt-8 pb-32 space-y-12">
            
            {startPageConfig.favorites && (
               <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[22px] font-bold tracking-tight">Favorites</h2>
                    <button 
                      className="text-ios-blue text-[15px] font-medium active:opacity-60"
                      onClick={() => setIsBookmarksOpen(true)}
                    >
                      Show All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                    {bookmarks.filter(b => b.category === 'favorites').map((site, i) => {
                      const initial = site.title[0];
                      let domain = site.title;
                      try {
                        domain = new URL(site.url).hostname;
                      } catch {}
                      const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                      return (
                        <button key={i} onClick={() => navigateTo(site.url)} className="flex flex-col items-center space-y-1.5 focus:outline-none">
                          <div className="w-[60px] h-[60px] bg-white dark:bg-[#1C1C1E] shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-2xl flex items-center justify-center active:brightness-90 dark:active:brightness-110 transition-all relative overflow-hidden p-2">
                             <img 
                               src={iconUrl} 
                               alt={site.title} 
                               className="w-full h-full object-contain rounded-[6px]" 
                               onError={(e) => { 
                                 e.currentTarget.style.display = 'none'; 
                                 e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
                               }} 
                             />
                             <span className="text-2xl font-semibold text-gray-400 dark:text-gray-500 hidden">{initial}</span>
                          </div>
                          <span className="text-[11px] text-gray-600 dark:text-gray-400 tracking-wide font-medium truncate w-[70px] text-center">{site.title}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>
            )}

            {startPageConfig.frequentlyVisited && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Frequently Visited</h2>
                 <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                   {bookmarks.filter(b => b.category === 'recently_saved').slice(0, 4).map((site, i) => {
                      let domain = site.title;
                      try { domain = new URL(site.url).hostname; } catch {}
                      const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                      return (
                        <button key={i} onClick={() => navigateTo(site.url)} className="flex flex-col items-center space-y-1.5 focus:outline-none">
                          <div className="w-[60px] h-[60px] bg-white dark:bg-[#1C1C1E] shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-2xl flex items-center justify-center active:brightness-90 dark:active:brightness-110 transition-all relative overflow-hidden p-2">
                             <img src={iconUrl} alt={site.title} className="w-full h-full object-contain rounded-[6px]" />
                          </div>
                          <span className="text-[11px] text-gray-600 dark:text-gray-400 tracking-wide font-medium truncate w-[70px] text-center">{site.title}</span>
                        </button>
                      )
                   })}
                 </div>
               </div>
            )}

            {startPageConfig.privacyReport && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Privacy Report</h2>
                 <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center space-x-4">
                   <Shield className="text-ios-blue w-8 h-8 flex-shrink-0" />
                   <div>
                     <p className="text-[15px] font-semibold">1,248 Trackers Prevented</p>
                     <p className="text-[13px] text-gray-500">In the last 7 days, Safari has prevented trackers from profiling you.</p>
                   </div>
                 </div>
               </div>
            )}

            {startPageConfig.sharedWithYou && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Shared with You</h2>
                 <div className="flex justify-center items-center h-20 text-gray-500 text-[15px]">No items shared with you</div>
               </div>
            )}

            {startPageConfig.siriSuggestions && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Siri Suggestions</h2>
                 <div className="flex justify-center items-center h-20 text-gray-500 text-[15px]">No suggestions available</div>
               </div>
            )}
            
            {startPageConfig.readingList && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Reading List</h2>
                 <div className="flex justify-center items-center h-20 text-gray-500 text-[15px]">No items in Reading List</div>
               </div>
            )}

            {startPageConfig.recentlyClosedTabs && (
               <div>
                 <h2 className="text-[22px] font-bold tracking-tight mb-6">Recently Closed Tabs</h2>
                 <div className="flex justify-center items-center h-20 text-gray-500 text-[15px]">No recently closed tabs</div>
               </div>
            )}

            <div className="flex justify-center pb-8 border-b border-gray-200 dark:border-gray-800">
               <button 
                 onClick={() => setIsCustomizeOpen(true)}
                 className="bg-white/50 dark:bg-[#1C1C1E]/50 border border-gray-200 dark:border-gray-800 backdrop-blur-md px-4 py-2 rounded-full text-[15px] font-medium shadow-sm active:bg-white dark:active:bg-[#1C1C1E] transition-colors"
               >
                 Edit
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-white dark:bg-black relative pt-2">
            <iframe
              key={iframeKey}
              src={currentUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-none bg-white min-h-[100dvh]"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="browser-view"
            />
          </div>
        )}
      </div>

      {/* Bottom Toolbar & Active Start Page indicator */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col items-center justify-end z-40">
        
        {/* Active Start Page Pill */}
        {!currentUrl && (
          <div 
            className="pointer-events-auto bg-white/75 dark:bg-[#1C1C1E]/75 backdrop-blur-3xl px-4 py-1.5 rounded-full flex items-center space-x-2 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.4)] border border-gray-200/50 dark:border-gray-800/50 mb-4 transition-transform active:scale-95 cursor-pointer"
            onClick={() => updateActiveTab({ currentIndex: -1, searchQuery: '' })}
          >
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex justify-center items-center">
              <LayoutGrid size={10} className="text-gray-500" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-black dark:text-white">Start Page</span>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        <div className="pointer-events-auto relative w-full pb-safe">
           {/* Glass background overlay */}
           <div className="absolute inset-0 bg-ios-toolbar dark:bg-ios-toolbar-dark backdrop-blur-2xl border-t border-gray-200/80 dark:border-gray-800/80 -z-10" />
           <div className="h-14 md:h-[83px] max-w-[600px] mx-auto w-full px-4 flex items-center justify-between">
              
              <button 
                onClick={goBack} 
                disabled={currentIndex < 0}
                className="p-2 text-ios-blue active:opacity-40 disabled:opacity-30 disabled:text-gray-400"
              >
                 <ChevronLeft size={28} strokeWidth={2.5} className="ml-[-4px]" />
              </button>
              <button 
                onClick={goForward}
                disabled={currentIndex >= history.length - 1}
                className="p-2 text-ios-blue active:opacity-40 disabled:opacity-30 disabled:text-gray-400"
              >
                 <ChevronRight size={28} strokeWidth={2.5} className="mr-[-4px]" />
              </button>
              
              <MoreMenuPopover 
                open={isMoreMenuOpen} 
                onOpenChange={setIsMoreMenuOpen}
                currentUrl={currentUrl}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                onAddBookmark={() => {
                  if (currentUrl) {
                    setBookmarks(prev => [{ id: Date.now().toString(), title: currentUrl.replace('https://', ''), url: currentUrl, category: 'recently_saved' }, ...prev]);
                  }
                }}
                onAddReadingList={() => {
                  if (currentUrl) {
                    setBookmarks(prev => [{ id: Date.now().toString(), title: currentUrl.replace('https://', ''), url: currentUrl, category: 'reading_list' }, ...prev]);
                  }
                }}
              >
                <button className="p-2 text-ios-blue active:opacity-40 flex items-center justify-center">
                   <MoreHorizontal size={26} strokeWidth={2} className="text-ios-blue relative top-[1px]" />
                </button>
              </MoreMenuPopover>
              
              <button onClick={() => setIsBookmarksOpen(true)} className="p-2 text-ios-blue active:opacity-40">
                 <Book size={26} strokeWidth={2} />
              </button>
              
              <button className="p-2 text-ios-blue active:opacity-40" onClick={() => setIsTabsViewOpen(true)}>
                 <Copy size={24} strokeWidth={2} className="rotate-90 relative top-[1px]" />
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isTabsViewOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            className="absolute inset-0 z-50 bg-[#F2F2F7] dark:bg-black overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-4 py-12 grid grid-cols-2 gap-4 content-start">
              {tabs.map((tab) => {
                const url = tab.currentIndex >= 0 ? tab.history[tab.currentIndex] : null;
                const domain = url ? (function(){ try { return new URL(url).hostname; } catch { return url; } })() : 'Start Page';
                const iconUrl = url ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
                return (
                  <div key={tab.id} className="relative flex flex-col items-center group">
                    <div className="flex items-center space-x-2 mb-2 w-full justify-center px-4">
                       {iconUrl && <img src={iconUrl} alt="" className="w-4 h-4 rounded-sm" onError={(e) => e.currentTarget.style.display = 'none'} />}
                       <span className="text-[13px] font-semibold text-black dark:text-white truncate">{domain}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTabId(tab.id);
                        setIsTabsViewOpen(false);
                      }}
                      className={cn("w-full aspect-[1/1.5] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm outline-none overflow-hidden relative cursor-pointer active:scale-95 transition-transform", activeTabId === tab.id ? "ring-2 ring-ios-blue ring-offset-2 ring-offset-[#F2F2F7] dark:ring-offset-black" : "")}
                    >
                      {url ? (
                        <div className="w-full h-full flex flex-col pt-4 items-center border border-gray-100 dark:border-gray-800 rounded-2xl">
                          <div className="w-3/4 h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                          <div className="w-1/2 h-2 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
                          <span className="text-gray-400 text-[10px] font-sans truncate w-full text-center px-2">{domain}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col pt-4 items-center border border-gray-100 dark:border-gray-800 rounded-2xl">
                          <div className="grid grid-cols-4 gap-1.5 px-4 mb-4 w-full">
                            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm" />)}
                          </div>
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={(e) => closeTab(tab.id, e)}
                      className="absolute top-8 right-2 w-6 h-6 bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white active:scale-90"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="h-14 md:h-[83px] pb-safe bg-ios-bg dark:bg-black border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
              <button onClick={addNewTab} className="p-2 text-ios-blue active:opacity-40">
                <Plus size={28} strokeWidth={2.5} />
              </button>
              <button onClick={() => setIsTabsViewOpen(false)} className="px-4 py-2 text-[17px] font-semibold text-ios-blue active:opacity-40 tracking-tight">
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookmarksSheet 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)} 
        bookmarks={bookmarks}
        folders={initialFolders}
        history={history}
        sortOrder={sortOrder}
        onNavigate={navigateTo}
      />
      <CustomizeStartPage 
        isOpen={isCustomizeOpen} 
        onClose={() => setIsCustomizeOpen(false)} 
        config={startPageConfig}
        onConfigChange={setStartPageConfig}
      />
    </div>
  );
}
