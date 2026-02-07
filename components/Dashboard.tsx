import React from 'react';
import { UserData, ViewState } from '../types';
import { ClipboardList, BarChart3, LogOut, Lock } from 'lucide-react';

interface DashboardProps {
  userData: UserData;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userData, onNavigate, onLogout }) => {
  const hasPre = !!userData.preAssessment;
  const hasPost = !!userData.postAssessment;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">안녕하세요, {userData.user.name}님</h1>
          <p className="text-slate-500">리더십 진단 현황 대시보드</p>
        </div>
        <button 
          onClick={onLogout}
          className="text-sm text-slate-400 hover:text-slate-700 flex items-center transition"
        >
          <LogOut className="w-4 h-4 mr-1" />
          로그아웃
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pre-Assessment Card */}
        <div className={`
          relative rounded-2xl p-8 border-2 transition-all duration-300
          ${hasPre 
            ? 'bg-white border-emerald-100 shadow-sm' 
            : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-md hover:shadow-xl cursor-pointer group'}
        `}>
          <div className="absolute top-6 right-6 p-2 bg-indigo-50 rounded-lg">
            <ClipboardList className={`w-8 h-8 ${hasPre ? 'text-emerald-500' : 'text-indigo-600'}`} />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">사전 리더십 진단</h2>
          <p className="text-slate-500 mb-8 min-h-[48px]">
             교육 전, 현재 나의 리더십 스타일을 Plan-Do-See 관점에서 진단합니다.
          </p>

          {hasPre ? (
            <div className="space-y-3">
              <div className="flex items-center text-emerald-600 font-medium mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                진단 완료 ({new Date(userData.preAssessment!.timestamp).toLocaleDateString()})
              </div>
              <button
                onClick={() => onNavigate(ViewState.RESULT)}
                className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
              >
                결과 다시보기
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate(ViewState.SURVEY_PRE)}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform group-hover:-translate-y-1"
            >
              진단 시작하기
            </button>
          )}
        </div>

        {/* Post-Assessment Card */}
        <div className={`
          relative rounded-2xl p-8 border-2 transition-all duration-300
          ${!hasPre
            ? 'bg-slate-50 border-slate-100 opacity-70' // Locked state
            : hasPost
              ? 'bg-white border-emerald-100 shadow-sm'
              : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-md hover:shadow-xl cursor-pointer group'}
        `}>
           <div className="absolute top-6 right-6 p-2 bg-indigo-50 rounded-lg">
            {hasPre ? (
              <BarChart3 className={`w-8 h-8 ${hasPost ? 'text-emerald-500' : 'text-indigo-600'}`} />
            ) : (
              <Lock className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">사후 리더십 진단</h2>
          <p className="text-slate-500 mb-8 min-h-[48px]">
            교육 후 변화된 리더십을 진단하고, 사전 진단 결과와 비교 분석합니다.
          </p>

          {!hasPre ? (
            <div className="flex items-center justify-center h-[52px] bg-slate-200 text-slate-500 rounded-xl font-medium cursor-not-allowed">
              사전 진단 필요
            </div>
          ) : hasPost ? (
            <div className="space-y-3">
               <div className="flex items-center text-emerald-600 font-medium mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                진단 완료 ({new Date(userData.postAssessment!.timestamp).toLocaleDateString()})
              </div>
              <button
                onClick={() => onNavigate(ViewState.RESULT)}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
              >
                비교 결과 보기
              </button>
            </div>
          ) : (
             <button
              onClick={() => onNavigate(ViewState.SURVEY_POST)}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform group-hover:-translate-y-1"
            >
              진단 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
