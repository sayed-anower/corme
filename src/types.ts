export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
  differentiationAngle: string;
}

export interface TechArchitecture {
  recommendedStack: string[];
  architectureOverview: string;
  developmentComplexity: string;
  estimatedBuildTime: string;
  keyRisks: string[];
}

export interface MonetizationStrategy {
  model: string;
  description: string;
  revenuePotential: string;
  difficulty: string;
}

export interface RoadmapMilestone {
  phase: string;
  timeline: string;
  actions: string[];
}

export interface MarketData {
  targetAudienceSize: string;
  marketTrends: string[];
  demandScore: number;
}

export interface SmokeTestAnalysis {
  projectTitle: string;
  tagline: string;
  feasibilityScore: number;
  passionMultiplier: number;
  analysisSummary: string;
  marketData: MarketData;
  competitors: Competitor[];
  techArchitecture: TechArchitecture;
  monetization: MonetizationStrategy[];
  growthRoadmap: RoadmapMilestone[];
  realityCheckQuestions: string[];
}

export interface AnalysisRequest {
  idea: string;
  targetAudience?: string;
  budget?: string;
  timeCommitment?: string;
}
