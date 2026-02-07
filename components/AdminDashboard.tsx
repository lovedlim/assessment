import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AdminUserSummary } from '../types';
import { RefreshCw, LogOut, Download } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const summary = await api.getAdminSummary();
      setUsers(summary);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const downloadCSV = () => {
    if (users.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // CSV Header
    const headers = [
      '이름',
      '식별번호',
      '사전_진단일',
      '사전_Plan',
      '사전_Do',
      '사전_See',
      '사후_진단일',
      '사후_Plan',
      '사후_Do',
      '사후_See'
    ];

    // CSV Rows
    const csvRows = [
      headers.join(','),
      ...users.map(user => {
        return [
          `"${user.name}"`, // 이름에 콤마가 있을 경우를 대비해 따옴표 처리
          `"${user.uniqueId}"`, // 숫자로 변환되지 않도록 처리
          user.preDate ? new Date(user.preDate).toLocaleDateString() : '',
          user.preScores ? user.preScores.Plan : '',
          user.preScores ? user.preScores.Do : '',
          user.preScores ? user.preScores.See : '',
          user.postDate ? new Date(user.postDate).toLocaleDateString() : '',
          user.postScores ? user.postScores.Plan : '',
          user.postScores ? user.postScores.Do : '',
          user.postScores ? user.postScores.See : '',
        ].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    // Excel에서 한글 깨짐 방지를 위해 BOM(Byte Order Mark) 추가 (\uFEFF)
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    
    // Download Link 생성 및 클릭
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `리더십진단_결과_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
            <p className="text-slate-500 flex items-center gap-2">
              전체 팀장 리더십 진단 현황
              {!isSupabaseConfigured() && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  Demo Mode (LocalStorage)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={downloadCSV}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white border border-transparent rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV 다운로드
            </button>
             <button 
              onClick={fetchAllData}
              className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">이름 (ID)</th>
                  <th scope="col" className="px-6 py-4 text-center">진단 상태</th>
                  <th scope="col" className="px-6 py-4 text-center">사전 진단일</th>
                  <th scope="col" className="px-6 py-4 text-center">사전 점수 (P/D/S)</th>
                  <th scope="col" className="px-6 py-4 text-center">사후 진단일</th>
                  <th scope="col" className="px-6 py-4 text-center">사후 점수 (P/D/S)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        데이터를 불러오는 중입니다...
                     </td>
                   </tr>
                ) : users.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        데이터가 없습니다.
                     </td>
                   </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.uniqueId} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {user.name} <span className="text-slate-400 font-normal ml-1">({user.uniqueId})</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.preDate && user.postDate ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">완료</span>
                        ) : user.preDate ? (
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-medium">진행 중</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-medium">미진단</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.preDate ? new Date(user.preDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.preScores ? (
                          <div className="inline-flex gap-1 font-mono text-xs">
                            <span className="bg-blue-50 text-blue-600 px-1 rounded">{user.preScores.Plan}</span>
                            <span className="bg-emerald-50 text-emerald-600 px-1 rounded">{user.preScores.Do}</span>
                            <span className="bg-amber-50 text-amber-600 px-1 rounded">{user.preScores.See}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.postDate ? new Date(user.postDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {user.postScores ? (
                          <div className="inline-flex gap-1 font-mono text-xs">
                            <span className="bg-blue-50 text-blue-600 px-1 rounded">{user.postScores.Plan}</span>
                            <span className="bg-emerald-50 text-emerald-600 px-1 rounded">{user.postScores.Do}</span>
                            <span className="bg-amber-50 text-amber-600 px-1 rounded">{user.postScores.See}</span>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};