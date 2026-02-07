import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS } from "../constants";

const getClient = () => {
  // Use process.env.API_KEY as per Google GenAI SDK guidelines.
  // The API key must be obtained exclusively from process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const calculateCategoryScores = (scores: Record<number, number>) => {
  const cats = { Plan: 0, Do: 0, See: 0 };
  Object.entries(scores).forEach(([qId, score]) => {
    const q = QUESTIONS.find((q) => q.id === parseInt(qId));
    if (q) {
      cats[q.category] += score;
    }
  });
  // Normalize to average (out of 5)
  return {
    Plan: (cats.Plan / 3).toFixed(1),
    Do: (cats.Do / 3).toFixed(1),
    See: (cats.See / 3).toFixed(1),
  };
};

export const generateLeadershipFeedback = async (
  preData: AssessmentData,
  postData?: AssessmentData
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key가 설정되지 않아 AI 분석을 사용할 수 없습니다.";

  const preScores = calculateCategoryScores(preData.scores);
  let prompt = "";

  if (!postData) {
    // Pre-assessment analysis
    prompt = `
      당신은 팀장 리더십 전문 코치입니다.
      한 팀장이 'Plan-Do-See' 리더십 진단을 완료했습니다. (5점 만점)
      
      [진단 결과]
      - Plan (계획): ${preScores.Plan}점
      - Do (실행): ${preScores.Do}점
      - See (점검): ${preScores.See}점

      이 점수를 바탕으로 이 팀장의 현재 리더십 스타일에 대한 3문단 이내의 간결한 진단과,
      앞으로의 리더십 교육에서 집중해야 할 포인트 2가지를 제안해주세요.
      친절하고 격려하는 톤으로 작성해주세요.
    `;
  } else {
    // Comparison analysis
    const postScores = calculateCategoryScores(postData.scores);
    prompt = `
      당신은 팀장 리더십 전문 코치입니다.
      한 팀장이 리더십 교육 전후로 'Plan-Do-See' 진단을 수행했습니다.

      [사전 진단 (교육 전)]
      - Plan: ${preScores.Plan}, Do: ${preScores.Do}, See: ${preScores.See}
      
      [사후 진단 (교육 후)]
      - Plan: ${postScores.Plan}, Do: ${postScores.Do}, See: ${postScores.See}

      1. 점수 변화를 바탕으로 어떤 영역(Plan/Do/See)에서 긍정적인 변화가 있었는지 분석해주세요.
      2. 교육의 효과가 가장 크게 나타난 부분과, 현업 복귀 후에도 꾸준히 신경 써야 할 부분을 조언해주세요.
      3. 격려와 함께 지속적인 성장을 위한 짧은 메시지를 남겨주세요.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "분석 결과를 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};