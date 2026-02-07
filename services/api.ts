import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserData, AdminUserSummary } from '../types';
import { QUESTIONS } from '../constants';

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

export const api = {
  login: async (user: User): Promise<UserData> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured. Please check environment variables.");
    }

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
  },

  saveAssessment: async (user: User, type: 'PRE' | 'POST', scores: Record<number, number>): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.");
    }

    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: user.uniqueId,
        type: type,
        scores: scores
      });
    if (error) throw error;
  },

  getAdminSummary: async (): Promise<AdminUserSummary[]> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.");
    }

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
  }
};