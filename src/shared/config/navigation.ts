import {
  Home,
  Workflow,
  Heart,
  Target,
  CalendarCheck,
  Award,
  Calendar,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: Home, description: '메인 페이지' },
  { label: '게임 플로우', href: '/content/game-flow', icon: Workflow, description: '게임 세션 관리' },
  { label: '라이프', href: '/content/life', icon: Heart, description: '라이프 시스템' },
  { label: '퀘스트', href: '/content/quest', icon: Target, description: '퀘스트 & 미션' },
  { label: '데일리 미션', href: '/content/daily-mission', icon: CalendarCheck, description: '일일 미션' },
  { label: '시즌 패스', href: '/content/season-pass', icon: Award, description: '시즌 패스' },
  { label: '이벤트', href: '/content/event', icon: Calendar, description: '기간 한정 이벤트' },
  { label: '랭킹', href: '/content/ranking', icon: Trophy, description: '랭킹 시스템' },
];
