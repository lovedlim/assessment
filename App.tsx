import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Survey } from './components/Survey';
import { ResultView } from './components/ResultView';
import { AdminDashboard } from './components/AdminDashboard';
import { User, UserData, ViewState, AssessmentData } from './types';
import { api } from './services/api';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Loader2, AlertTriangle, Database } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  
  // Connection Check States
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      // 1. Check if Environment Variables are present
      if (!isSupabaseConfigured()) {
        setConnectionError("환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_KEY)가 설정되지 않았습니다.");
        setIsCheckingConnection(false);
        return;
      }

      // 2. Try a real connection test
      try {
        // We try to fetch 0 rows just to check authentication and connectivity
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
          // If the table doesn't exist, it's still a connection success but schema error.
          // However, we treat any API error as a blocker to ensure stability.
          throw error;
        }
        setIsCheckingConnection(false);
      } catch (err: any) {
        console.error("Supabase Connection Failed:", err);
        setConnectionError(`Supabase 연결 실패: ${err.message || "알 수 없는 오류가 발생했습니다."}`);
        setIsCheckingConnection(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  const handleLogin = async (user: User) => {
    setIsLoading(true);
    
    try {
      // 1. 서버(DB)에서 로그인 처리 및 데이터 조회
      const data = await api.login(user);
      
      // 2. DB에서 반환된 isAdmin 플래그 확인
      if (data.user.isAdmin) {
        setCurrentUser(data.user);
        setView(ViewState.ADMIN);
      } else {
        setCurrentUser(user);
        setUserData(data);
        setView(ViewState.DASHBOARD);
      }
    } catch (e: any) {
      console.error(e);
      alert(`로그인 실패: ${e.message || '오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserData(null);
    setView(ViewState.LOGIN);
  };

  const handleSurveyComplete = async (scores: Record<number, number>) => {
    if (!currentUser || !userData) return;
    setIsLoading(true);

    const isPre = view === ViewState.SURVEY_PRE;
    const type = isPre ? 'PRE' : 'POST';

    try {
      await api.saveAssessment(currentUser, type, scores);

      // Update local state to reflect change immediately without refetching
      const newAssessment: AssessmentData = {
        scores,
        timestamp: new Date().toISOString()
      };

      setUserData({
        ...userData,
        [isPre ? 'preAssessment' : 'postAssessment']: newAssessment
      });

      setView(ViewState.RESULT);
    } catch (e: any) {
      console.error(e);
      alert(`저장 실패: ${e.message || '오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initial Loading Screen (Checking Connection)
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">서버 연결 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 2. Connection Error Screen (Blocking Access)
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertTriangle className="w-8 h-8" />
            <h1 className="text-xl font-bold">시스템 연결 오류</h1>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            데이터베이스(Supabase)와 연결할 수 없어 앱을 실행할 수 없습니다.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Database className="w-4 h-4" />
              에러 상세 내용
            </div>
            <code className="text-xs text-red-500 break-all font-mono block">
              {connectionError}
            </code>
          </div>

          <div className="text-sm text-slate-500 space-y-2 border-t pt-4">
            <p><strong>확인 사항:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vercel 등 배포 환경의 <code>Environment Variables</code> 설정 확인</li>
              <li><code>VITE_SUPABASE_URL</code> 및 <code>VITE_SUPABASE_KEY</code> 값의 정확성</li>
              <li>Supabase 프로젝트의 활성화 상태</li>
            </ul>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal App Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  if (view === ViewState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  if (view === ViewState.ADMIN) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (!userData) return null;

  if (view === ViewState.DASHBOARD) {
    return (
      <Dashboard 
        userData={userData} 
        onNavigate={setView} 
        onLogout={handleLogout} 
      />
    );
  }

  if (view === ViewState.SURVEY_PRE) {
    return (
      <Survey 
        type="PRE" 
        onComplete={handleSurveyComplete} 
        onCancel={() => setView(ViewState.DASHBOARD)} 
      />
    );
  }

  if (view === ViewState.SURVEY_POST) {
    return (
      <Survey 
        type="POST" 
        onComplete={handleSurveyComplete} 
        onCancel={() => setView(ViewState.DASHBOARD)} 
      />
    );
  }

  if (view === ViewState.RESULT) {
    if (!userData.preAssessment) {
      setView(ViewState.DASHBOARD);
      return null;
    }
    return (
      <ResultView 
        preData={userData.preAssessment} 
        postData={userData.postAssessment} 
        onBack={() => setView(ViewState.DASHBOARD)}
      />
    );
  }

  return <div>Unknown State</div>;
};

export default App;