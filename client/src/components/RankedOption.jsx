import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
// import { RankedOption } from '../api/chat';

// interface Props {
//   option: RankedOption;
//   index: number;
//   onSelect: () => void;
// }

export const RankedOptionCard= ({ option, index, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score) => {
    const colors = ['text-green-400', 'text-green-300', 'text-yellow-300', 'text-orange-300', 'text-red-400'];
    return colors[score - 1] || colors[0];
  };

  return (
    <div className="glass-morphism bg-gray-700/50 rounded-lg p-4 border border-gray-600 transition-all duration-300 hover:bg-gray-700/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-semibold text-purple-400">{index + 1}</span>
            <h3 className="text-lg font-medium text-gray-100">{option.option}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 ${getScoreColor(option.scores.average)}`} />
              <span className="text-gray-300">Priority Score: {option.scores.average.toFixed(1)}</span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Details
                </>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          Select
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-4 space-y-3 text-sm text-gray-300 border-t border-gray-600 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className={`font-medium mb-1 ${getScoreColor(option.scores.relevance)}`}>
                Relevance: {option.scores.relevance}
              </div>
            </div>
            <div>
              <div className={`font-medium mb-1 ${getScoreColor(option.scores.impact)}`}>
                Impact: {option.scores.impact}
              </div>
            </div>
            <div>
              <div className={`font-medium mb-1 ${getScoreColor(option.scores.feasibility)}`}>
                Feasibility: {option.scores.feasibility}
              </div>
            </div>
          </div>
          <p className="text-gray-400">{option.explanation}</p>
        </div>
      )}
    </div>
  );
};