import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { AssessmentData, Category } from '../types';
import { QUESTIONS } from '../constants';
import { generateLeadershipFeedback } from '../services/geminiService';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

interface ResultViewProps {
  preData: AssessmentData;
  postData?: AssessmentData;
  onBack: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ preData, postData, onBack }) => {
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Prepare Data for Radar Chart
  const calculateScores = (scores: Record<number, number>) => {
    const data: Record<Category, { total: number; count: number }> = {
      Plan: { total: 0, count: 0 },
      Do: { total: 0, count: 0 },
      See: { total: 0, count: 0 },
    };

    Object.entries(scores).forEach(([qId, score]) => {
      const q = QUESTIONS.find(qt => qt.id === parseInt(qId));
      if (q) {
        data[q.category].total += score;
        data[q.category].count += 1;
      }
    });

    return {
      Plan: Number((data.Plan.total / data.Plan.count).toFixed(2)),
      Do: Number((data.Do.total / data.Do.count).toFixed(2)),
      See: Number((data.See.total / data.See.count).toFixed(2)),
    };
  };

  const preScores = calculateScores(preData.scores);
  const postScores = postData ? calculateScores(postData.scores) : null;

  const chartData = [
    { subject: 'Plan (계획)', A: preScores.Plan, B: postScores?.Plan || 0, fullMark: 5 },
    { subject: 'Do (실행)', A: preScores.Do, B: postScores?.Do || 0, fullMark: 5 },
    { subject: 'See (점검)', A: preScores.See, B: postScores?.See || 0, fullMark: 5 },
  ];

  const handleGetAiFeedback = async () => {
    setLoading(true);
    try {
      const feedback = await generateLeadershipFeedback(preData, postData);
      setAiFeedback(feedback);
    } catch (e) {
      console.error(e);
      setAiFeedback("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" />
          대시보드로 이동
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {postData ? '리더십 변화 리포트' : '리더십 진단 결과'}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Plan-Do-See 역량 분석</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="사전 진단"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                {postData && (
                  <Radar
                    name="사후 진단"
                    dataKey="B"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                )}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            * 5점 만점 기준입니다.
          </div>
        </div>

        {/* Text Stats Section */}
        <div className="space-y-6">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 gap-4">
             {['Plan', 'Do', 'See'].map((cat) => {
                const scoreA = preScores[cat as Category];
                const scoreB = postScores ? postScores[cat as Category] : null;
                const diff = scoreB !== null ? (scoreB - scoreA).toFixed(2) : null;
                
                return (
                 <div key={cat} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat} Score</span>
                      <div className="text-2xl font-bold text-slate-800">
                         {postData ? scoreB : scoreA} <span className="text-sm text-slate-400 font-normal">/ 5.0</span>
                      </div>
                    </div>
                    {postData && diff && (
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${Number(diff) >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {Number(diff) >= 0 ? '+' : ''}{diff}
                      </div>
                    )}
                 </div>
                );
             })}
           </div>
        </div>
      </div>

      {/* AI Feedback Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              AI 리더십 코칭
            </h3>
            
            {!aiFeedback && !loading && (
              <p className="text-slate-600 leading-relaxed mb-6">
                현재 점수를 바탕으로 Gemini AI가 맞춤형 피드백과 성장 가이드를 제공합니다.
                {postData ? ' 교육 전후 변화를 분석하여 더 구체적인 조언을 확인해보세요.' : ' 나의 리더십 강점과 보완점을 확인해보세요.'}
              </p>
            )}

            {loading && (
               <div className="flex items-center space-x-3 text-indigo-600 py-8">
                 <Loader2 className="w-6 h-6 animate-spin" />
                 <span>AI가 결과를 분석하고 있습니다...</span>
               </div>
            )}

            {aiFeedback && (
              <div className="prose prose-indigo max-w-none text-slate-700 bg-white/60 p-6 rounded-xl border border-indigo-100/50 shadow-sm whitespace-pre-wrap leading-relaxed">
                {aiFeedback}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
             <button
               onClick={handleGetAiFeedback}
               disabled={loading}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {aiFeedback ? '분석 다시 하기' : 'AI 분석 요청하기'}
               <Sparkles className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
