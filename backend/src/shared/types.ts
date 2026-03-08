export type Dog = { id: string; name: string; picture: string; planId?: string };
export type Training = { id: string; name: string; procedure: string; tips: string };
export type Plan = { id: string; name: string; schedule: Record<string, string[]> };
export type Session = { id: string; dogId: string; trainingId: string; date: string; status: string; planId?: string; score?: number; notes?: string };
