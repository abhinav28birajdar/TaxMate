// lib/advanced-utils.ts
// Advanced utility functions for Taxmate features

/**
 * Calculate client lifetime value (LTV)
 */
export function calculateClientLTV(
  avgMonthlyValue: number,
  retentionMonths: number,
  marginPercent: number
): number {
  return avgMonthlyValue * retentionMonths * (marginPercent / 100);
}

/**
 * Calculate customer acquisition cost (CAC)
 */
export function calculateCAC(marketingCost: number, newClients: number): number {
  return marketingCost / newClients;
}

/**
 * Calculate LTV/CAC ratio
 */
export function calculateLTVCACRatio(ltv: number, cac: number): number {
  return ltv / cac;
}

/**
 * Calculate monthly recurring revenue (MRR)
 */
export function calculateMRR(invoiceAmounts: number[]): number {
  return invoiceAmounts.reduce((a, b) => a + b, 0);
}

/**
 * Calculate annual recurring revenue (ARR)
 */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}

/**
 * Predict revenue for next N days
 */
export function predictRevenue(
  historicalData: { date: string; amount: number }[],
  daysAhead: number
): number {
  if (historicalData.length < 2) return 0;

  const avgDaily =
    historicalData.reduce((sum, item) => sum + item.amount, 0) /
    historicalData.length;

  return avgDaily * daysAhead;
}

/**
 * Calculate growth rate percentage
 */
export function calculateGrowthRate(
  previousValue: number,
  currentValue: number
): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(revenue: number, profit: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/**
 * Calculate compliance score
 */
export function calculateComplianceScore(
  totalItems: number,
  completedItems: number,
  onTimeItems: number
): number {
  if (totalItems === 0) return 0;

  const completionRate = (completedItems / totalItems) * 100;
  const onTimeRate = (onTimeItems / totalItems) * 100;

  return (completionRate * 0.7 + onTimeRate * 0.3) / 100 * 100;
}

/**
 * Calculate productivity score
 */
export function calculateProductivityScore(
  tasksCompleted: number,
  tasksAssigned: number,
  avgCompletionTime: number
): number {
  const completionRate =
    tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;
  const timeEfficiency = Math.max(0, 100 - avgCompletionTime * 2); // Reduce score for longer times

  return (completionRate * 0.6 + Math.min(timeEfficiency, 100) * 0.4) / 100 * 100;
}

/**
 * Calculate client satisfaction score
 */
export function calculateSatisfactionScore(
  averageRating: number,
  totalReviews: number,
  responseTime: number // in hours
): number {
  const ratingScore = (averageRating / 5) * 100;
  const responseScore = Math.max(0, 100 - responseTime * 5);
  const reviewScore = Math.min(100, (totalReviews / 50) * 100);

  return (ratingScore * 0.5 + responseScore * 0.3 + reviewScore * 0.2) / 100 * 100;
}

/**
 * Intelligent client classification
 */
export function classifyClient(
  monthlyRevenue: number,
  paymentHistory: number,
  serviceUsage: number
): 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD' {
  const score = monthlyRevenue * 0.5 + paymentHistory * 0.3 + serviceUsage * 0.2;

  if (score >= 100000) return 'PLATINUM';
  if (score >= 50000) return 'GOLD';
  if (score >= 20000) return 'SILVER';
  return 'STANDARD';
}

/**
 * Calculate churn risk
 */
export function calculateChurnRisk(
  inactivityDays: number,
  lastPurchaseDays: number,
  supportTickets: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  let riskScore = 0;

  if (inactivityDays > 60) riskScore += 50;
  else if (inactivityDays > 30) riskScore += 25;

  if (lastPurchaseDays > 180) riskScore += 40;
  else if (lastPurchaseDays > 90) riskScore += 20;

  if (supportTickets > 5) riskScore += 10;

  if (riskScore >= 70) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Recommend services for client
 */
export function recommendServices(
  clientType: string,
  revenue: number,
  currentServices: string[]
): string[] {
  const allServices = [
    'GST Filing',
    'ITR Filing',
    'Audit',
    'Accounting',
    'Payroll',
    'Registration',
    'Compliance',
  ];

  let recommendations: string[] = [];

  if (clientType === 'BUSINESS' && revenue > 500000) {
    recommendations = [
      'Audit',
      'Compliance',
      'Payroll',
      'Accounting',
    ];
  } else if (clientType === 'STARTUP') {
    recommendations = [
      'Registration',
      'GST Filing',
      'ITR Filing',
      'Accounting',
    ];
  } else if (clientType === 'INDIVIDUAL') {
    recommendations = [
      'ITR Filing',
      'Accounting',
      'Tax Planning',
    ];
  }

  return recommendations.filter((s) => !currentServices.includes(s));
}

/**
 * Calculate document expiry risk
 */
export function getDocumentExpiryStatus(
  expiryDate: Date
): 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'SAFE' {
  const today = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'EXPIRED';
  if (daysUntilExpiry <= 7) return 'CRITICAL';
  if (daysUntilExpiry <= 30) return 'WARNING';
  return 'SAFE';
}

/**
 * Generate compliance alert
 */
export function generateComplianceAlert(
  itemName: string,
  dueDate: Date,
  completionPercent: number
): {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
} {
  const today = new Date();
  const daysUntilDue = Math.floor(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue < 0 && completionPercent < 100) {
    return {
      severity: 'CRITICAL',
      message: `${itemName} is OVERDUE!`,
    };
  }

  if (daysUntilDue <= 7 && completionPercent < 100) {
    return {
      severity: 'WARNING',
      message: `${itemName} is due in ${daysUntilDue} days`,
    };
  }

  return {
    severity: 'INFO',
    message: `${itemName} due by ${dueDate.toLocaleDateString()}`,
  };
}

/**
 * Calculate CA workload
 */
export function calculateCAWorkload(
  tasksAssigned: number,
  avgTaskTime: number
): {
  totalHours: number;
  workloadPercent: number;
  status: 'OVERLOAD' | 'HEAVY' | 'MODERATE' | 'LIGHT';
} {
  const totalHours = tasksAssigned * avgTaskTime;
  const workloadPercent = (totalHours / (5 * 8)) * 100; // 5 days, 8 hours/day

  let status: 'OVERLOAD' | 'HEAVY' | 'MODERATE' | 'LIGHT';
  if (workloadPercent > 120) status = 'OVERLOAD';
  else if (workloadPercent > 100) status = 'HEAVY';
  else if (workloadPercent > 60) status = 'MODERATE';
  else status = 'LIGHT';

  return { totalHours, workloadPercent, status };
}

/**
 * Smart matching algorithm
 */
export function calculateMatchScore(
  clientProfile: {
    industry: string;
    location: string;
    budget: number;
  },
  caProfile: {
    specialties: string[];
    experience: number;
    location: string;
    avgClientBudget: number;
  }
): number {
  let score = 0;

  // Specialty match (40%)
  if (caProfile.specialties.includes(clientProfile.industry)) {
    score += 40;
  }

  // Location match (20%)
  if (caProfile.location === clientProfile.location) {
    score += 20;
  }

  // Budget match (25%)
  if (clientProfile.budget >= caProfile.avgClientBudget * 0.8 &&
    clientProfile.budget <= caProfile.avgClientBudget * 1.2) {
    score += 25;
  }

  // Experience bonus (15%)
  if (caProfile.experience >= 5) {
    score += 15;
  }

  return Math.round(score);
}
