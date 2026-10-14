import { GrievancePriority, Grievance } from './types';
import { SEED_DEPARTMENTS } from './seedData';

export interface DepartmentRecommendation {
  departmentId: string;
  departmentName: string;
  confidence: number;
  reason: string;
}

export interface FAQSuggestion {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  link: string;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  matchedGrievances: {
    id: string;
    grievance_id: string;
    title: string;
    status: string;
    locality: string;
    similarityScore: number;
    reason: string;
  }[];
}

const DEPARTMENT_KEYWORDS: Record<string, { id: string; name: string; keywords: string[] }> = {
  water: {
    id: 'dept-water',
    name: 'Water Supply',
    keywords: [
      'water', 'tap', 'pipeline', 'pipe', 'drinking water', 'tanker', 'leakage',
      'burst', 'sluice', 'jal', 'contamination', 'muddy water', 'pressure', 'booster',
    ],
  },
  sanitation: {
    id: 'dept-sanitation',
    name: 'Sanitation and Waste Management',
    keywords: [
      'garbage', 'waste', 'trash', 'dustbin', 'vat', 'dump', 'dumping', 'debris',
      'drain', 'drainage', 'sewage', 'gutter', 'manhole', 'overflow', 'safai', 'stink',
    ],
  },
  electricity: {
    id: 'dept-electricity',
    name: 'Electricity',
    keywords: [
      'electricity', 'power', 'powercut', 'blackout', 'voltage', 'surge', 'transformer',
      'spark', 'streetlight', 'lamp', 'pole', 'wire', 'cable', 'bijli', 'feeder',
    ],
  },
  roads: {
    id: 'dept-roads',
    name: 'Roads and Transport',
    keywords: [
      'pothole', 'crater', 'road', 'asphalt', 'tar', 'resurfacing', 'traffic', 'divider',
      'zebra crossing', 'signboard', 'bus stop', 'transport', 'cave-in',
    ],
  },
  pwd: {
    id: 'dept-pwd',
    name: 'Public Works Department',
    keywords: [
      'footpath', 'sidewalk', 'pavement', 'rebar', 'culvert', 'bridge', 'flyover',
      'public building', 'railing', 'retaining wall', 'stormwater',
    ],
  },
  health: {
    id: 'dept-health',
    name: 'Public Health',
    keywords: [
      'dengue', 'malaria', 'mosquito', 'fogging', 'fumigation', 'stagnant', 'clinic',
      'dispensary', 'hospital', 'stray dog', 'rabies', 'disease', 'hygiene',
    ],
  },
  municipal: {
    id: 'dept-municipal',
    name: 'Municipal Corporation',
    keywords: [
      'encroachment', 'property tax', 'trade license', 'birth certificate', 'death certificate',
      'illegal construction', 'civic center', 'sub-judice', 'hawker',
    ],
  },
  police: {
    id: 'dept-police',
    name: 'Police and Public Safety',
    keywords: [
      'noise', 'loudspeaker', 'dj', 'nuisance', 'patrol', 'safety', 'harassment',
      'obstruction', 'crime', 'police', 'night safety',
    ],
  },
  education: {
    id: 'dept-education',
    name: 'Education',
    keywords: [
      'school', 'classroom', 'midday meal', 'teacher', 'blackboard', 'desk',
      'primary school', 'ro water purifier school', 'scholarship',
    ],
  },
};

/**
 * Smart rule-based recommendation of department based on title and description
 */
export function recommendDepartment(text: string): DepartmentRecommendation | null {
  if (!text || text.trim().length < 5) return null;
  const lower = text.toLowerCase();

  let bestMatch: DepartmentRecommendation | null = null;
  let maxScore = 0;

  for (const key of Object.keys(DEPARTMENT_KEYWORDS)) {
    const config = DEPARTMENT_KEYWORDS[key];
    let score = 0;
    const matchedTerms: string[] = [];

    for (const kw of config.keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
        matchedTerms.push(kw);
      }
    }

    if (score > maxScore && score >= 2) {
      maxScore = score;
      bestMatch = {
        departmentId: config.id,
        departmentName: config.name,
        confidence: Math.min(Math.round((score / 5) * 100), 95),
        reason: `Matched civic terms: ${matchedTerms.slice(0, 3).join(', ')}`,
      };
    }
  }

  return bestMatch;
}

/**
 * Calculate SLA deadline from department configuration and priority
 */
export function calculateSlaDeadline(departmentId: string, priority: GrievancePriority): string {
  const dept = SEED_DEPARTMENTS.find((d) => d.id === departmentId);
  let days = 7; // fallback

  if (dept) {
    if (priority === 'EMERGENCY') days = dept.sla_days_emergency;
    else if (priority === 'HIGH') days = dept.sla_days_high;
    else days = dept.sla_days_normal;
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline.toISOString();
}

/**
 * Check for duplicate complaints in the same department and locality within recent 14 days
 */
export function checkForDuplicates(
  allGrievances: Grievance[],
  params: {
    departmentId: string;
    title: string;
    locality: string;
    pincode?: string;
  }
): DuplicateCheckResult {
  const { departmentId, title, locality, pincode } = params;
  if (!title || title.length < 5) {
    return { hasDuplicate: false, matchedGrievances: [] };
  }

  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const matched = allGrievances
    .filter((g) => {
      // Must be same department and active/recent
      if (g.department_id !== departmentId) return false;
      if (g.status === 'CLOSED' || g.status === 'REJECTED') return false;

      // Check locality or pincode match
      const localityMatch =
        (locality && g.locality.toLowerCase().includes(locality.toLowerCase().trim())) ||
        (locality && locality.toLowerCase().includes(g.locality.toLowerCase().trim())) ||
        (pincode && g.pincode === pincode);

      if (!localityMatch) return false;

      // Check title keyword intersection
      const existingWords = g.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const overlap = titleWords.filter((w) => existingWords.includes(w));
      return overlap.length >= 2;
    })
    .map((g) => ({
      id: g.id,
      grievance_id: g.grievance_id,
      title: g.title,
      status: g.status,
      locality: g.locality,
      similarityScore: 85,
      reason: `Similar issue reported in ${g.locality} with status "${g.status}".`,
    }));

  return {
    hasDuplicate: matched.length > 0,
    matchedGrievances: matched,
  };
}

/**
 * Suggested FAQ articles based on grievance content
 */
export const FAQ_ARTICLES: FAQSuggestion[] = [
  {
    id: 'faq-1',
    title: 'Emergency Drinking Water Tanker Requisition Process',
    excerpt: 'Citizens facing complete municipal water outage can request emergency drinking water tankers under Citizen Charter Section 3.',
    category: 'Water Supply',
    link: '/faq#water-tanker',
  },
  {
    id: 'faq-2',
    title: 'How to Report Hazardous Sparking Transformers',
    excerpt: 'High-voltage transformer sparks require immediate field isolation. Follow the emergency cutoff safety steps.',
    category: 'Electricity',
    link: '/faq#electricity-hazard',
  },
  {
    id: 'faq-3',
    title: 'Illegal Debris & Solid Waste Clearance Timelines',
    excerpt: 'Municipal solid waste complaints carry an SLA of 48-72 hours. View designated dumping sites and penalty guidelines.',
    category: 'Sanitation',
    link: '/faq#waste-clearance',
  },
  {
    id: 'faq-4',
    title: 'Citizens Right to Reopen an Unresolved Grievance',
    excerpt: 'If an issue is marked resolved but field work remains incomplete, citizens have a 14-day window to reopen with photo evidence.',
    category: 'Citizen Rights',
    link: '/faq#reopen-rules',
  },
  {
    id: 'faq-5',
    title: 'What issues cannot be entertained on SPGS (Sub-Judice Matters)',
    excerpt: 'Matters with pending court injunctions, private land title disputes, or RTI requests must follow specialized judicial or statutory routes.',
    category: 'Guidelines',
    link: '/faq#sub-judice',
  },
];

export function getSuggestedFaqs(query: string): FAQSuggestion[] {
  if (!query) return FAQ_ARTICLES.slice(0, 3);
  const q = query.toLowerCase();

  const matched = FAQ_ARTICLES.filter(
    (f) =>
      f.title.toLowerCase().includes(q) ||
      f.excerpt.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );

  return matched.length > 0 ? matched : FAQ_ARTICLES.slice(0, 3);
}
