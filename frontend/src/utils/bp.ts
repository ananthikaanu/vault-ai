export interface BPReading {
  systolic: number;
  diastolic: number;
  raw: string;
}

export interface BPStatus {
  label: string;
  color: string;
  bg: string;
  emoji: string;
}

// AHA 2017 classification
export function classifyBP(sys: number, dia: number): BPStatus {
  if (sys > 180 || dia > 120)
    return { label: "Crisis", color: "#dc2626", bg: "rgba(220,38,38,0.15)", emoji: "🚨" };
  if (sys >= 140 || dia >= 90)
    return { label: "High Stage 2", color: "#ef4444", bg: "rgba(239,68,68,0.12)", emoji: "🔴" };
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89))
    return { label: "High Stage 1", color: "#f97316", bg: "rgba(249,115,22,0.12)", emoji: "🟠" };
  if (sys >= 120 && sys <= 129 && dia < 80)
    return { label: "Elevated", color: "#eab308", bg: "rgba(234,179,8,0.12)", emoji: "🟡" };
  if (sys < 90 || dia < 60)
    return { label: "Low", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", emoji: "🔵" };
  return { label: "Normal", color: "#10b981", bg: "rgba(16,185,129,0.12)", emoji: "🟢" };
}

// Extract all BP readings from text like "120/80" or "130 / 90 mmHg"
export function extractBP(text: string): BPReading[] {
  const pattern = /\b(\d{2,3})\s*\/\s*(\d{2,3})\b/g;
  const results: BPReading[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const sys = parseInt(match[1], 10);
    const dia = parseInt(match[2], 10);
    // Sanity check — valid BP range
    if (sys >= 50 && sys <= 250 && dia >= 30 && dia <= 150) {
      results.push({ systolic: sys, diastolic: dia, raw: match[0] });
    }
  }
  return results;
}
