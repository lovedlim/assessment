import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserData, AssessmentData, AdminUserSummary } from '../types';
import { QUESTIONS } from '../constants';

const LS_KEYS = {
  USERS: 'tlc_users',
  ASSESSMENTS: 'tlc_assessments',
};

// Helper: Calculate scores (used for Admin Summary)
const calculateAvgScores = (scores: Record<string, number>) => {
  const cats = { Plan: 0, Do: 0, See: 0 };
  Object.entries(scores).forEach(([qId, score]) => {
    const q = QUESTIONS.find((q) => q.id === parseInt(qId));
    if (q) {
      cats[q.category] += score;
    }
  });
  return {
    Plan: Number((cats.Plan / 3).toFixed(1)),
    Do: Number((cats.Do / 3).toFixed(1)),
    See: Number((cats.See / 3).toFixed(1)),
  };
};

// Helper: LocalStorage Mock Delay
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const api = {
  login: async (user: User): Promise<UserData> => {
    if (isSupabaseConfigured()) {
      // --- SUPABASE LOGIC ---
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('unique_id', user.uniqueId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // 관리자 권한 확인 및 사용자 객체 업데이트
      let isAdmin = false;

      if (!existingUser) {
        // 새 유저 생성 (기본적으로 관리자 아님)
        const { error: insertError } = await supabase
          .from('users')
          .insert({ unique_id: user.uniqueId, name: user.name, is_admin: false });
        if (insertError) throw insertError;
      } else {
        // 기존 유저 정보 업데이트 (이름 변경 시)
        isAdmin = existingUser.is_admin; // DB에서 관리자 여부 가져오기
        if (existingUser.name !== user.name) {
          await supabase.from('users').update({ name: user.name }).eq('unique_id', user.uniqueId);
        }
      }

      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.uniqueId);

      if (assessmentError) throw assessmentError;

      return {
        user: { ...user, isAdmin }, // 관리자 여부 포함
        preAssessment: assessments?.find((a: any) => a.type === 'PRE') 
          ? { scores: assessments.find((a: any) => a.type === 'PRE').scores, timestamp: assessments.find((a: any) => a.type === 'PRE').created_at } 
          : undefined,
        postAssessment: assessments?.find((a: any) => a.type === 'POST')
          ? { scores: assessments.find((a: any) => a.type === 'POST').scores, timestamp: assessments.find((a: any) => a.type === 'POST').created_at }
          : undefined,
      };

    } else {
      // --- LOCAL STORAGE LOGIC ---
      // Demo 모드에서도 'admin1234'를 관리자로 취급
      await mockDelay();
      const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
      let existingUser = users.find((u: User) => u.uniqueId === user.uniqueId);
      
      const isAdmin = user.uniqueId === 'admin1234';

      if (!existingUser) {
        existingUser = { ...user, isAdmin };
        users.push(existingUser);
        localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
      } else if (existingUser.name !== user.name) {
        existingUser.name = user.name;
        localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
      }

      const allAssessments = JSON.parse(localStorage.getItem(LS_KEYS.ASSESSMENTS) || '[]');
      const userAssessments = allAssessments.filter((a: any) => a.userId === user.uniqueId);

      return {
        user: { ...user, isAdmin },
        preAssessment: userAssessments.find((a: any) => a.type === 'PRE'),
        postAssessment: userAssessments.find((a: any) => a.type === 'POST'),
      };
    }
  },

  saveAssessment: async (user: User, type: 'PRE' | 'POST', scores: Record<number, number>): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.uniqueId,
          type: type,
          scores: scores
        });
      if (error) throw error;
    } else {
      await mockDelay();
      const allAssessments = JSON.parse(localStorage.getItem(LS_KEYS.ASSESSMENTS) || '[]');
      const newAssessment = {
        userId: user.uniqueId,
        type,
        scores,
        timestamp: new Date().toISOString()
      };
      allAssessments.push(newAssessment);
      localStorage.setItem(LS_KEYS.ASSESSMENTS, JSON.stringify(allAssessments));
    }
  },

  getAdminSummary: async (): Promise<AdminUserSummary[]> => {
    if (isSupabaseConfigured()) {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`unique_id, name, assessments (type, scores, created_at)`)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      return (usersData || []).map((u: any) => {
        const pre = u.assessments.find((a: any) => a.type === 'PRE');
        const post = u.assessments.find((a: any) => a.type === 'POST');
        return {
          uniqueId: u.unique_id,
          name: u.name,
          preDate: pre ? pre.created_at : null,
          postDate: post ? post.created_at : null,
          preScores: pre ? calculateAvgScores(pre.scores) : null,
          postScores: post ? calculateAvgScores(post.scores) : null,
        };
      });
    } else {
      await mockDelay();
      const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
      const assessments = JSON.parse(localStorage.getItem(LS_KEYS.ASSESSMENTS) || '[]');

      return users.map((u: User) => {
        const userAssessments = assessments.filter((a: any) => a.userId === u.uniqueId);
        const pre = userAssessments.find((a: any) => a.type === 'PRE');
        const post = userAssessments.find((a: any) => a.type === 'POST');
        return {
          uniqueId: u.uniqueId,
          name: u.name,
          preDate: pre ? pre.timestamp : null,
          postDate: post ? post.timestamp : null,
          preScores: pre ? calculateAvgScores(pre.scores) : null,
          postScores: post ? calculateAvgScores(post.scores) : null,
        };
      });
    }
  }
};