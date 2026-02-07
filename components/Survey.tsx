import React, { useState } from 'react';
import { QUESTIONS, LIKERT_SCALE } from '../constants';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface SurveyProps {
  type: 'PRE' | 'POST';
  onComplete: (scores: Record<number, number>) => void;
  onCancel: () => void;
}

export const Survey: React.FC<SurveyProps> = ({ type, onComplete, onCancel }) => {
  const [scores, setScores] = useState<Record<number, number>>({});

  const handleScore = (questionId: number, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = QUESTIONS.every(q => scores[q.id] !== undefined);
  const progress = Math.round((Object.keys(scores).length / QUESTIONS.length) * 100);

  const handleSubmit = () => {
    if (isComplete) {
      // Scroll to top
      window.scrollTo(0, 0);
      onComplete(scores);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="mb-8 sticky top-0 bg-[#f8fafc] z-10 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onCancel} className="flex items-center text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft className="w-5 h-5 mr-1" />
            돌아가기
          </button>
          <span className="font-semibold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full text-sm">
            {type === 'PRE' ? '사전 진단' : '사후 진단'}
          </span>
        </div>
        
        <div className="space-y-2">
           <div className="flex justify-between text-sm text-slate-600">
             <span>진행률</span>
             <span className="font-bold text-indigo-600">{progress}%</span>
           </div>
           <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 transition hover:shadow-md">
            <div className="flex items-start mb-4">
              <span className={`
                flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mr-3
                ${q.category === 'Plan' ? 'bg-blue-100 text-blue-700' : 
                  q.category === 'Do' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-amber-100 text-amber-700'}
              `}>
                {q.category[0]}
              </span>
              <div>
                <h3 className="text-lg font-medium text-slate-800 leading-snug">
                  {idx + 1}. {q.text}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-4">
              {LIKERT_SCALE.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleScore(q.id, option.value)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
                    ${scores[q.id] === option.value 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 ring-offset-1' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600'}
                  `}
                >
                  <span className="text-xl font-bold mb-1">{option.value}</span>
                  <span className="text-[10px] sm:text-xs text-center leading-tight">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg flex justify-center z-20">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`
            flex items-center px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform
            ${isComplete 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105' 
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
          `}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          진단 제출하기
        </button>
      </div>
    </div>
  );
};
