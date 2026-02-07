export type Category = 'Plan' | 'Do' | 'See';

export interface Question {
  id: number;
  category: Category;
  text: string;
}

export interface User {
  name: string;
  uniqueId: string;
  isAdmin?: boolean;
}

export interface AssessmentData {
  scores: Record<number, number>; // questionId -> score
  timestamp: string;
  feedback?: string;
}

export interface UserData {
  user: User;
  preAssessment?: AssessmentData;
  postAssessment?: AssessmentData;
}

// For Admin Dashboard
export interface AdminUserSummary {
  uniqueId: string;
  name: string;
  preDate: string | null;
  postDate: string | null;
  preScores: { Plan: number; Do: number; See: number } | null;
  postScores: { Plan: number; Do: number; See: number } | null;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SURVEY_PRE = 'SURVEY_PRE',
  SURVEY_POST = 'SURVEY_POST',
  RESULT = 'RESULT',
  ADMIN = 'ADMIN',
}