import { Language, NavigationItem } from './types';
import { Globe, BookOpen, BarChart2, HelpCircle } from 'lucide-react';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'global-search', title: 'Global Search', path: '/global-search' },
  { id: 'curate-test', title: 'Curate Test', path: '/curate-test' },
  { id: 'learning-pathway', title: 'Learning Pathway', path: '/learning-pathway' },
  { id: 'need-help', title: 'Need Help?', path: '/help' },
];

export const FEATURES = [
  {
    title: 'Global Search',
    description: 'Access vast educational resources with our powerful AI-driven search engine tailored for academic content.',
    icon: Globe,
  },
  {
    title: 'Curate Test',
    description: 'Create customized assessments and quizzes based on specific learning objectives and curriculum requirements.',
    icon: BookOpen,
  },
  {
    title: 'Learning Pathway',
    description: 'Follow personalized learning journeys designed to match your pace, style, and educational goals.',
    icon: BarChart2,
  },
  {
    title: 'Need Help?',
    description: 'Get instant assistance with homework, research, or any academic questions from our AI assistant.',
    icon: HelpCircle,
  },
];