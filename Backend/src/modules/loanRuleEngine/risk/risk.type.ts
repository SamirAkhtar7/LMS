export type RiskGrade = "A" | "B" | "C" | "D" | "E" | "F";
export type RiskScoreResult = {
    grade: RiskGrade;
    score: number;
    reasons: string[];
}