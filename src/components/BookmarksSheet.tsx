import * as Dialog from '@radix-ui/react-dialog';
import { BottomSheet } from './BottomSheet';
import { BookOpen, Glasses, Clock, ChevronLeft } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';
import { useState, type ReactNode, type FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type BookmarkCategory = 'favorites' | 'recently_saved' | 'history' | 'reading_list';

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category: BookmarkCategory;
  folderId?: string;
}

export interface FolderItem {
  id: string;
  name: string;
}

export function BookmarksSheet({ 
  isOpen, 
  onClose,
  bookmarks,
  folders,
  history,
  sortOrder,
  onNavigate
}: { 
  isOpen: boolean; 
  onClose: () => void,
  bookmarks: BookmarkItem[],
  folders: FolderItem[],
  history: string[],
  sortOrder: string,
  onNavigate: (url: string) => void
}) {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [viewStack, setViewStack] = useState<string[]>(['main']);
  
  const currentView = viewStack[viewStack.length - 1];
  const pushView = (view: string) => setViewStack([...viewStack, view]);
  const popView = () => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  };

  // Reset view stack when sheet is closed
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setViewStack(['main']);
      setActiveTab('bookmarks');
    }, 300);
  };

  const handleSelectBookmark = (url: string) => {
    onNavigate(url);
    handleClose();
  };

  const sortItems = (items: BookmarkItem[]) => {
    const list = [...items];
    if (sortOrder === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    // Default favorites or date added (handled by reverse if needed, but we keep default array order)
    return list;
  };

  const readingListItems = sortItems(bookmarks.filter(b => b.category === 'reading_list'));
  const favoritesItems = sortItems(bookmarks.filter(b => b.category === 'favorites'));
  const recentlySavedItems = sortItems(bookmarks.filter(b => b.category === 'recently_saved'));
  const allBookmarks = sortItems(bookmarks.filter(b => b.category !== 'reading_list'));

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} className="bg-[#F2F2F7] dark:bg-[#000000]">
      <Dialog.Title className="sr-only">Bookmarks</Dialog.Title>
      <Dialog.Description className="sr-only">Manage your bookmarks, reading list, and history.</Dialog.Description>
      <Tabs.Root value={activeTab} onValueChange={(val) => { setActiveTab(val); setViewStack(['main']); }} className="flex flex-col h-full">
        <div className="px-4 pb-2 border-b border-ios-separator dark:border-ios-separator-dark flex justify-center">
          <Tabs.List className="flex space-x-0 bg-gray-200/60 dark:bg-gray-800/60 p-0.5 rounded-[9px] w-[200px]">
             {/* Built to match iOS Segmented Control */}
             <TabTrigger value="bookmarks" icon={<BookOpen size={18} strokeWidth={2} />} isActive={activeTab === 'bookmarks'} />
             <TabTrigger value="reading-list" icon={<Glasses size={18} strokeWidth={2} />} isActive={activeTab === 'reading-list'} />
             <TabTrigger value="history" icon={<Clock size={18} strokeWidth={2} />} isActive={activeTab === 'history'} />
          </Tabs.List>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F2F2F7] dark:bg-black relative">
          <Tabs.Content value="bookmarks" className="focus:outline-none outline-none absolute inset-0 h-full w-full">
            <AnimatePresence initial={false} custom={viewStack.length}>
              {currentView === 'main' && (
                <motion.div
                  key="main"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  className="absolute inset-0 pt-4 px-4 h-full"
                >
                  <h2 className="text-[28px] font-bold tracking-tight mb-4 ml-2">Bookmarks</h2>
                  
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm">
                    <ListItem label="Favorites" icon="star" onClick={() => pushView('favorites')} />
                    <ListItem label="Recently Saved" icon="clock" hasSeparator onClick={() => pushView('recently_saved')} />
                    <ListItem label="Folders" icon="folder" hasSeparator onClick={() => pushView('folders')} />
                    <ListItem label="All Bookmarks" icon="book" hasSeparator onClick={() => pushView('all')} />
                  </div>
                </motion.div>
              )}
              
              {currentView === 'favorites' && (
                <BookmarkListView 
                  key="favorites"
                  title="Favorites" 
                  items={favoritesItems} 
                  onBack={popView}
                  onSelect={handleSelectBookmark}
                />
              )}

              {currentView === 'recently_saved' && (
                <BookmarkListView 
                  key="recently_saved"
                  title="Recently Saved" 
                  items={recentlySavedItems} 
                  onBack={popView}
                  onSelect={handleSelectBookmark}
                />
              )}

              {currentView === 'folders' && (
                <FoldersListView 
                  key="folders"
                  folders={folders} 
                  onBack={popView}
                  onSelectFolder={(id) => pushView(`folder_${id}`)}
                />
              )}

              {currentView === 'all' && (
                <BookmarkListView 
                  key="all"
                  title="All Bookmarks" 
                  items={allBookmarks} 
                  onBack={popView}
                  onSelect={handleSelectBookmark}
                />
              )}
            </AnimatePresence>
          </Tabs.Content>

          {/* Reading List Tab */}
          <Tabs.Content value="reading-list" className="focus:outline-none outline-none absolute inset-0 pt-4 px-4 h-full">
             <h2 className="text-[28px] font-bold tracking-tight mb-4 ml-2">Reading List</h2>
             {readingListItems.length === 0 ? (
               <div className="flex justify-center items-center h-40 text-gray-500">No Items</div>
             ) : (
               <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm overflow-y-auto">
                 {readingListItems.map((item, i) => (
                   <BookmarkRow 
                     key={item.id} 
                     item={item} 
                     hasSeparator={i < readingListItems.length - 1} 
                     onClick={() => handleSelectBookmark(item.url)} 
                   />
                 ))}
               </div>
             )}
          </Tabs.Content>

          {/* History Tab */}
          <Tabs.Content value="history" className="focus:outline-none outline-none absolute inset-0 pt-4 px-4 h-full">
             <div className="flex items-center justify-between mb-4 mt-1">
               <h2 className="text-[28px] font-bold tracking-tight ml-2">History</h2>
             </div>
             
             {history.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-gray-500">No History</div>
             ) : (
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm">
                  {history.slice().reverse().map((url, i) => (
                    <HistoryItem 
                      key={i} 
                      url={url} 
                      hasSeparator={i < history.length - 1} 
                      onClick={() => handleSelectBookmark(url)} 
                    />
                  ))}
                </div>
             )}
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </BottomSheet>
  );
}

const BookmarkListView: FC<{ title: string, items: BookmarkItem[], onBack: () => void, onSelect: (url: string) => void }> = ({ title, items, onBack, onSelect }) => {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="absolute inset-0 pt-2 px-4 bg-[#F2F2F7] dark:bg-black h-full flex flex-col"
    >
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-60 -ml-2 mr-1">
          <ChevronLeft size={28} strokeWidth={2.5} />
          <span className="text-[17px] -mt-0.5">Back</span>
        </button>
      </div>
      <h2 className="text-[28px] font-bold tracking-tight mb-4 ml-2">{title}</h2>
      
      {items.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-500">No Bookmarks</div>
      ) : (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm overflow-y-auto">
          {items.map((item, i) => (
            <BookmarkRow 
              key={item.id} 
              item={item} 
              hasSeparator={i < items.length - 1} 
              onClick={() => onSelect(item.url)} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const FoldersListView: FC<{ folders: FolderItem[], onBack: () => void, onSelectFolder: (id: string) => void }> = ({ folders, onBack, onSelectFolder }) => {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="absolute inset-0 pt-2 px-4 bg-[#F2F2F7] dark:bg-black h-full flex flex-col"
    >
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="flex items-center text-ios-blue active:opacity-60 -ml-2 mr-1">
          <ChevronLeft size={28} strokeWidth={2.5} />
          <span className="text-[17px] -mt-0.5">Back</span>
        </button>
      </div>
      <h2 className="text-[28px] font-bold tracking-tight mb-4 ml-2">Folders</h2>
      
      {folders.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-500">No Folders</div>
      ) : (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm overflow-y-auto">
          {folders.map((folder, i) => (
            <ListItem 
              key={folder.id} 
              label={folder.name} 
              icon="folder" 
              hasSeparator={i < folders.length - 1} 
              onClick={() => onSelectFolder(folder.id)} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const BookmarkRow: FC<{ item: BookmarkItem, hasSeparator: boolean, onClick: () => void }> = ({ item, hasSeparator, onClick }) => {
  let domain = item.url;
  try {
    domain = new URL(item.url).hostname;
  } catch {}
  const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <button onClick={onClick} className="w-full relative flex items-center bg-white dark:bg-[#1C1C1E] px-4 py-[11px] active:bg-gray-200 dark:active:bg-gray-800 transition-colors">
      {hasSeparator && <div className="absolute top-0 left-[52px] right-0 h-[0.5px] bg-ios-separator dark:bg-ios-separator-dark" />}
      
      <div className="w-[30px] h-[30px] flex justify-center items-center mr-3 relative overflow-hidden bg-gray-100 flex-shrink-0 dark:bg-gray-800 rounded-md">
         <img 
           src={iconUrl} 
           alt="" 
           className="w-[18px] h-[18px] object-contain" 
           onError={(e) => { 
             e.currentTarget.style.display = 'none'; 
             e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
           }} 
         />
         <BookOpen size={18} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500 hidden absolute" />
      </div>
      <div className="flex flex-col items-start justify-center flex-1 overflow-hidden">
        <span className="text-[17px] -tracking-[0.41px] text-black dark:text-white truncate w-full text-left font-medium">{item.title}</span>
        <span className="text-[13px] text-gray-500 truncate w-full text-left">{item.url}</span>
      </div>
    </button>
  );
}

const HistoryItem: FC<{ url: string, hasSeparator: boolean, onClick: () => void }> = ({ url, hasSeparator, onClick }) => {
  // Extract domain simply
  const domainMatch = [...url.matchAll(/https?:\/\/([^/]+)/g)]?.[0]?.[1];
  const domain = domainMatch || url;
  const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  return (
    <button onClick={onClick} className="w-full relative flex items-center bg-white dark:bg-[#1C1C1E] px-4 py-[11px] active:bg-gray-200 dark:active:bg-gray-800 transition-colors">
      {hasSeparator && <div className="absolute top-0 left-[52px] right-0 h-[0.5px] bg-ios-separator dark:bg-ios-separator-dark" />}
      
      <div className="w-[30px] h-[30px] flex justify-center items-center mr-3 relative overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md">
         <img 
           src={iconUrl} 
           alt="" 
           className="w-[18px] h-[18px] object-contain" 
           onError={(e) => { 
             e.currentTarget.style.display = 'none'; 
             e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
           }} 
         />
         <Clock size={18} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500 hidden absolute" />
      </div>
      
      <div className="flex flex-col items-start justify-center flex-1 overflow-hidden py-1">
        <span className="text-[17px] -tracking-[0.41px] text-black dark:text-white truncate w-full text-left font-medium">{domain}</span>
        <span className="text-[13px] text-gray-500 truncate w-full text-left">{url}</span>
      </div>
    </button>
  );
}

const TabTrigger: FC<{ value: string, icon: ReactNode, isActive: boolean }> = ({ value, icon, isActive }) => {
  return (
    <Tabs.Trigger 
      value={value} 
      className={cn(
        "relative flex-1 flex flex-col items-center justify-center py-[5px] text-sm rounded-[7px] transition-colors z-10",
        isActive ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="activeTabBadge"
          className="absolute inset-0 bg-white shadow-sm dark:bg-[#636366] rounded-[7px] -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      {icon}
    </Tabs.Trigger>
  )
}

const ListItem: FC<{ label: string, icon: string, hasSeparator?: boolean, onClick?: () => void }> = ({ label, icon, hasSeparator, onClick }) => {
  return (
    <button onClick={onClick} className="w-full relative flex items-center bg-white dark:bg-[#1C1C1E] px-4 py-[11px] active:bg-gray-200 dark:active:bg-gray-800 transition-colors">
      {hasSeparator && <div className="absolute top-0 left-[52px] right-0 h-[0.5px] bg-ios-separator dark:bg-ios-separator-dark" />}
      
      <div className="w-[30px] flex justify-start items-center text-ios-blue">
         {/* Simple icon mockups */}
         {icon === 'star' && <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
         {icon === 'clock' && <Clock size={22} strokeWidth={1.5} />}
         {icon === 'folder' && <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>}
         {icon === 'book' && <BookOpen size={22} strokeWidth={1.5} />}
      </div>
      <span className="text-[17px] -tracking-[0.41px] text-black dark:text-white ml-2">{label}</span>
      <div className="ml-auto text-gray-300 dark:text-gray-600">
        <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  )
}

