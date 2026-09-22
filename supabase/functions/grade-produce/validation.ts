export function validateGradeReport(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid model report')
  const report = value as Record<string, unknown>
  if (![null, 'A', 'B', 'C'].includes(report.suggested_grade as string | null)) throw new Error('Invalid suggested grade')
  const strings = (input: unknown) => Array.isArray(input) && input.length <= 12 && input.every(item => typeof item === 'string' && item.trim().length > 0 && item.length <= 600)
  if (!strings(report.observations) || !strings(report.limitations)) throw new Error('Invalid model observations')
  if (typeof report.model_version !== 'string' || !report.model_version.trim() || report.model_version.length > 100) throw new Error('Missing model version')
  return {
    suggested_grade: report.suggested_grade as string | null,
    observations: report.observations as string[],
    limitations: report.limitations as string[],
    model_version: report.model_version.trim(),
    requires_human_review: true,
  }
}
