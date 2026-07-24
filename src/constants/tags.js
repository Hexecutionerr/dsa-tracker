// src/constants/tags.js

export const MISTAKE_TAGS = [
  { name: 'Wrong Logic', color: '#ff7675', bg: 'rgba(255, 118, 117, 0.15)', border: 'rgba(255, 118, 117, 0.35)', category: 'Mistakes' },
  { name: 'Edge Case', color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)', border: 'rgba(253, 203, 110, 0.35)', category: 'Mistakes' },
  { name: 'Syntax', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.35)', category: 'Mistakes' },
  { name: 'Time Limit', color: '#ff5e00', bg: 'rgba(255, 94, 0, 0.15)', border: 'rgba(255, 94, 0, 0.35)', category: 'Mistakes' },
  { name: 'Revision Needed', color: '#0984e3', bg: 'rgba(9, 132, 227, 0.15)', border: 'rgba(9, 132, 227, 0.35)', category: 'Mistakes' },
];

export const PATTERN_TAGS = [
  { name: 'Sliding Window', color: '#00cec9', bg: 'rgba(0, 206, 201, 0.15)', border: 'rgba(0, 206, 201, 0.35)', category: 'Patterns' },
  { name: 'Binary Search', color: '#6c5ce7', bg: 'rgba(108, 92, 231, 0.15)', border: 'rgba(108, 92, 231, 0.35)', category: 'Patterns' },
  { name: 'Greedy', color: '#e17055', bg: 'rgba(225, 112, 85, 0.15)', border: 'rgba(225, 112, 85, 0.35)', category: 'Patterns' },
  { name: 'DP', color: '#e84393', bg: 'rgba(232, 67, 147, 0.15)', border: 'rgba(232, 67, 147, 0.35)', category: 'Patterns' },
  { name: 'Graph', color: '#fd79a8', bg: 'rgba(253, 121, 168, 0.15)', border: 'rgba(253, 121, 168, 0.35)', category: 'Patterns' },
  { name: 'Trie', color: '#00b894', bg: 'rgba(0, 184, 148, 0.15)', border: 'rgba(0, 184, 148, 0.35)', category: 'Patterns' },
  { name: 'DFS', color: '#a29bfe', bg: 'rgba(162, 155, 254, 0.15)', border: 'rgba(162, 155, 254, 0.35)', category: 'Patterns' },
  { name: 'BFS', color: '#74b9ff', bg: 'rgba(116, 185, 255, 0.15)', border: 'rgba(116, 185, 255, 0.35)', category: 'Patterns' },
];

export const COMPANY_TAGS = [
  { name: 'Amazon', color: '#ff9900', bg: 'rgba(255, 153, 0, 0.15)', border: 'rgba(255, 153, 0, 0.35)', category: 'Companies' },
  { name: 'Google', color: '#4285f4', bg: 'rgba(66, 133, 244, 0.15)', border: 'rgba(66, 133, 244, 0.35)', category: 'Companies' },
  { name: 'Microsoft', color: '#00a4ef', bg: 'rgba(0, 164, 239, 0.15)', border: 'rgba(0, 164, 239, 0.35)', category: 'Companies' },
  { name: 'Adobe', color: '#ff4757', bg: 'rgba(255, 71, 87, 0.15)', border: 'rgba(255, 71, 87, 0.35)', category: 'Companies' },
  { name: 'Oracle', color: '#ff6b81', bg: 'rgba(255, 107, 129, 0.15)', border: 'rgba(255, 107, 129, 0.35)', category: 'Companies' },
  { name: 'TCS', color: '#70a1ff', bg: 'rgba(112, 161, 255, 0.15)', border: 'rgba(112, 161, 255, 0.35)', category: 'Companies' },
  { name: 'Capgemini', color: '#1e90ff', bg: 'rgba(30, 144, 255, 0.15)', border: 'rgba(30, 144, 255, 0.35)', category: 'Companies' },
];

export const PRESET_TAGS = [...MISTAKE_TAGS, ...PATTERN_TAGS, ...COMPANY_TAGS];

export function getTagStyle(tagName) {
  const preset = PRESET_TAGS.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  if (preset) return preset;
  return { name: tagName, color: '#e0e0e0', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.2)', category: 'Custom' };
}
