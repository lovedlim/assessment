import React, { useState } from 'react';
import { User, UserData } from '../types';
import { User as UserIcon, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [uniqueId, setUniqueId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && uniqueId.trim()) {
      onLogin({ name, uniqueId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">리더십 진단 시스템</h1>
          <p className="text-slate-500">Plan-Do-See 기반 팀장 역량 진단</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">이름</label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="uniqueId" className="text-sm font-medium text-slate-700">식별 고유 번호</label>
            <div className="relative">
              <input
                id="uniqueId"
                type="text"
                required
                className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="예: 1234 (본인 확인용)"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              * 회원가입이 아니며, 결과 조회 및 비교를 위한 식별자로 사용됩니다.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-200 transform active:scale-95"
          >
            진단 시작하기
          </button>
        </form>
      </div>
    </div>
  );
};
