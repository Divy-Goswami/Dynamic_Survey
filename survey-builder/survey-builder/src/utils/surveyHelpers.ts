import { SurveyQuestion, SkipLogicRule, SurveySettings } from '@/lib/supabase'

export function evaluateSkipLogic(
  question: SurveyQuestion,
  allQuestions: SurveyQuestion[],
  answers: Record<string, any>
): boolean {
  if (!question.skip_logic || Object.keys(question.skip_logic).length === 0) {
    return true // Show question if no skip logic
  }

  const rules = question.skip_logic.rules as SkipLogicRule[] || []
  
  if (rules.length === 0) return true

  // Evaluate all rules - question is shown if ANY rule matches (OR logic)
  for (const rule of rules) {
    const sourceQuestion = allQuestions.find(q => q.id === rule.questionId)
    if (!sourceQuestion) continue

    const sourceAnswer = answers[rule.questionId]
    let matches = false

    switch (rule.condition) {
      case 'equals':
        matches = sourceAnswer === rule.value || 
                  (Array.isArray(sourceAnswer) && sourceAnswer.includes(rule.value))
        break
      case 'not_equals':
        matches = sourceAnswer !== rule.value && 
                  (!Array.isArray(sourceAnswer) || !sourceAnswer.includes(rule.value))
        break
      case 'contains':
        const answerStr = Array.isArray(sourceAnswer) ? sourceAnswer.join(' ') : String(sourceAnswer || '')
        matches = answerStr.toLowerCase().includes(String(rule.value).toLowerCase())
        break
      case 'not_contains':
        const answerStr2 = Array.isArray(sourceAnswer) ? sourceAnswer.join(' ') : String(sourceAnswer || '')
        matches = !answerStr2.toLowerCase().includes(String(rule.value).toLowerCase())
        break
      case 'greater_than':
        matches = Number(sourceAnswer) > Number(rule.value)
        break
      case 'less_than':
        matches = Number(sourceAnswer) < Number(rule.value)
        break
      case 'is_empty':
        matches = !sourceAnswer || 
                  (Array.isArray(sourceAnswer) && sourceAnswer.length === 0) ||
                  (typeof sourceAnswer === 'string' && sourceAnswer.trim() === '')
        break
      case 'is_not_empty':
        matches = !!sourceAnswer && 
                  (!Array.isArray(sourceAnswer) || sourceAnswer.length > 0) &&
                  (typeof sourceAnswer !== 'string' || sourceAnswer.trim() !== '')
        break
    }

    if (matches) {
      return rule.action === 'show' // Show if action is 'show', hide if 'hide'
    }
  }

  return false // Hide by default if no rules match
}

export function randomizeArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function applyRandomization(
  questions: SurveyQuestion[],
  settings: SurveySettings
): SurveyQuestion[] {
  let processedQuestions = [...questions]

  if (settings.randomization?.randomizeQuestions) {
    processedQuestions = randomizeArray(processedQuestions)
  }

  if (settings.randomization?.randomizeOptions) {
    processedQuestions = processedQuestions.map(q => ({
      ...q,
      options: randomizeArray(q.options),
    }))
  }

  return processedQuestions
}

export function calculateScore(
  questions: SurveyQuestion[],
  answers: Record<string, any>
): { total: number; max: number; percentage: number } {
  let total = 0
  let max = 0

  questions.forEach(question => {
    if (question.score !== undefined && question.score > 0) {
      max += question.score
      const answer = answers[question.id]
      
      // Simple scoring: if answer matches expected value or is correct
      // This is a basic implementation - you can enhance it
      if (answer !== undefined && answer !== null && answer !== '') {
        // For now, award full points if answered (you can add correct answer checking)
        total += question.score
      }
    }
  })

  return {
    total,
    max,
    percentage: max > 0 ? Math.round((total / max) * 100) : 0,
  }
}

export function validateAnswer(
  question: SurveyQuestion,
  answer: any
): { valid: boolean; message?: string } {
  const rules = question.validation_rules || {}

  if (question.is_required) {
    if (answer === undefined || answer === null || answer === '') {
      return { valid: false, message: 'This question is required' }
    }
    if (Array.isArray(answer) && answer.length === 0) {
      return { valid: false, message: 'This question is required' }
    }
  }

  if (rules.min_length && typeof answer === 'string' && answer.length < rules.min_length) {
    return { valid: false, message: `Minimum length is ${rules.min_length} characters` }
  }

  if (rules.max_length && typeof answer === 'string' && answer.length > rules.max_length) {
    return { valid: false, message: `Maximum length is ${rules.max_length} characters` }
  }

  if (rules.pattern && typeof answer === 'string') {
    const regex = new RegExp(rules.pattern)
    if (!regex.test(answer)) {
      return { valid: false, message: rules.message || 'Invalid format' }
    }
  }

  if (rules.min && Number(answer) < Number(rules.min)) {
    return { valid: false, message: `Minimum value is ${rules.min}` }
  }

  if (rules.max && Number(answer) > Number(rules.max)) {
    return { valid: false, message: `Maximum value is ${rules.max}` }
  }

  if (rules.type === 'email' && typeof answer === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(answer)) {
      return { valid: false, message: 'Please enter a valid email address' }
    }
  }

  if (rules.type === 'url' && typeof answer === 'string') {
    try {
      new URL(answer)
    } catch {
      return { valid: false, message: 'Please enter a valid URL' }
    }
  }

  return { valid: true }
}

