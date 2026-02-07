import React, { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Survey } from './components/Survey';
import { ResultView } from './components/ResultView';
import { AdminDashboard } from './components/AdminDashboard';
import { User, UserData, ViewState, AssessmentData } from './types';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (e) {
      console.error(e);
      alert('로그인 또는 데이터 불러오기 중 오류가 발생했습니다.');
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
    } catch (e) {
      console.error(e);
      alert('결과 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Logic
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