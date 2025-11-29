import React from 'react';
import { AnalysisFactor } from '../types';
import { Plus, Check } from 'lucide-react';

interface FactorButtonProps {
  factor: AnalysisFactor;
  isSelected: boolean;
  onClick: () => void;
}

const FactorButton: React.FC<FactorButtonProps> = ({ factor, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-start p-3 rounded-xl border text-left transition-all duration-200
        ${isSelected 
          ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20' 
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
        }
      `}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            factor.category === 'Flow' ? 'bg-blue-500/20 text-blue-400' :
            factor.category === 'Technical' ? 'bg-purple-500/20 text-purple-400' :
            'bg-orange-500/20 text-orange-400'
          }`}>
            {factor.category}
          </span>
          <h3 className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
            {factor.name}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed pr-6">
          {factor.description}
        </p>
      </div>
      
      <div className={`absolute top-3 right-3 transition-colors ${isSelected ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
        {isSelected ? <Check size={18} /> : <Plus size={18} />}
      </div>
    </button>
  );
};

export default FactorButton;
