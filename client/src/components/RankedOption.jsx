import React from "react"
import { Star, Info } from "lucide-react"

export const RankedOptionCard = ({
  option,
  score,
  rank,
  onExplanationRequest
}) => {
  return (
    <div className="glass-morphism bg-gray-700/50 rounded-xl p-4 border border-gray-600 mb-4 hover:bg-gray-700/70 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 text-white rounded-full w-4 h-4 p-3 flex items-center justify-center">
            {rank}
          </div>
          <h3 className="text-lg font-semibold text-gray-100">{option}</h3>
        </div>
        <button
          onClick={onExplanationRequest}
          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
          title="View explanation"
        >
          <Info className="w-4 h-4 text-gray-300" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <ScoreIndicator label="Relevance" score={score.relevance} />
        <ScoreIndicator label="Impact" score={score.impact} />
        <ScoreIndicator label="Feasibility" score={score.feasibility} />
      </div>
    </div>
  )
}

const ScoreIndicator = ({ label, score }) => {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}