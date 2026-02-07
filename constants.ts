import { Question } from './types';

export const QUESTIONS: Question[] = [
  // PLAN
  {
    id: 1,
    category: 'Plan',
    text: '우리 팀의 목표와 우선순위를 명확한 기준과 이유를 들어 설명할 수 있다.',
  },
  {
    id: 2,
    category: 'Plan',
    text: '팀 목표를 설정할 때, 조직의 방향성과 팀원의 현실적인 업무 상황을 함께 고려한다.',
  },
  {
    id: 3,
    category: 'Plan',
    text: '단기 성과뿐 아니라 중·장기적으로 팀이 성장할 수 있는 방향을 고민하며 계획을 세운다.',
  },
  // DO
  {
    id: 4,
    category: 'Do',
    text: '팀원들에게 업무를 지시할 때, 왜 이 일이 필요한지 배경과 기대 결과를 함께 설명한다.',
  },
  {
    id: 5,
    category: 'Do',
    text: '팀원 각자의 역량과 상황을 고려해 업무를 배분하고, 필요한 지원을 제공한다.',
  },
  {
    id: 6,
    category: 'Do',
    text: '계획대로 일이 진행되지 않을 때, 책임을 묻기보다 해결 방법을 함께 찾으려 한다.',
  },
  // SEE
  {
    id: 7,
    category: 'See',
    text: '업무 결과뿐 아니라 과정에서의 어려움과 개선 포인트를 함께 돌아본다.',
  },
  {
    id: 8,
    category: 'See',
    text: '팀원에게 피드백을 줄 때, 평가보다는 성장에 도움이 되는 방향으로 전달하려 노력한다.',
  },
  {
    id: 9,
    category: 'See',
    text: '팀의 성과나 문제를 통해 내 리더십 방식 자체를 돌아보고 조정한다.',
  },
];

export const LIKERT_SCALE = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '그렇지 않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
];
