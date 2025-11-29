import React, { useState, useRef, useEffect } from 'react';
import { PRESET_SECTORS } from '../constants';
import { Search, X, Plus, ChevronDown } from 'lucide-react';

interface SectorSelectorProps {
  selectedSectors: string[];
  onToggle: (sector: string) => void;
}

const SectorSelector: React.FC<SectorSelectorProps> = ({ selectedSectors, onToggle }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = PRESET_SECTORS.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) && 
    !selectedSectors.includes(s.name)
  );

  const handleSelect = (name: string) => {
    onToggle(name);
    setQuery('');
    // Keep focus for quick multi-select
  };

  const handleCustomAdd = () => {
    if (query.trim()) {
      onToggle(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="space-y-3" ref={wrapperRef}>
      {/* Input Area */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
        <input
          type="text"
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600"
          placeholder="搜索板块 (例如 '锂电池', '低空经济') 或输入自定义..."
          value={query}
          onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomAdd();
              }
          }}
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={16} />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto overflow-x-hidden">
            {filtered.map(sector => (
              <button
                key={sector.id}
                onClick={() => handleSelect(sector.name)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between group/item"
              >
                {sector.name}
                <Plus size={14} className="opacity-0 group-hover/item:opacity-100 text-emerald-400 transition-opacity" />
              </button>
            ))}
            
            {query && !filtered.find(s => s.name.toLowerCase() === query.toLowerCase()) && (
                <button
                    onClick={handleCustomAdd}
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-slate-800 border-t border-slate-800 flex items-center gap-2"
                >
                    <Plus size={14} />
                    <span>添加自定义主题: <span className="font-semibold">"{query}"</span></span>
                </button>
            )}

            {filtered.length === 0 && !query && (
                 <div className="px-4 py-3 text-xs text-slate-500 text-center">输入名称搜索行业或概念...</div>
            )}
          </div>
        )}
      </div>

      {/* Selected Chips */}
      {selectedSectors.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
            {selectedSectors.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border border-blue-500/30 animate-in fade-in zoom-in duration-200">
                {s}
                <button 
                    onClick={() => onToggle(s)} 
                    className="hover:text-white hover:bg-blue-500/40 rounded-full p-0.5 transition-colors"
                >
                <X size={12} />
                </button>
            </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default SectorSelector;