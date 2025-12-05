import { createClient } from '@supabase/supabase-js'

// These will be set during deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Survey {
  id: string
  user_id: string
  title: string
  description: string
  settings: SurveySettings
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface SurveyQuestion {
  id: string
  survey_id: string
  question_text: string
  question_type: 'text' | 'multiple_choice' | 'checkbox' | 'dropdown' | 'rating' | 'file' | 'matrix' | 'date' | 'time' | 'ranking'
  options: string[]
  validation_rules: Record<string, any>
  order_index: number
  is_required: boolean
  help_text: string
  skip_logic: Record<string, any>
  score?: number // For quiz/scoring questions
}

export interface SkipLogicRule {
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  questionId: string
  value: any
  action: 'show' | 'hide' | 'skip_to'
  targetQuestionId?: string
}

export interface ValidationRule {
  type: 'min_length' | 'max_length' | 'pattern' | 'min' | 'max' | 'email' | 'url' | 'number' | 'custom'
  value?: any
  message?: string
  pattern?: string
}

export interface SurveySettings {
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    fontFamily?: string
    logoUrl?: string
  }
  randomization?: {
    randomizeQuestions?: boolean
    randomizeOptions?: boolean
  }
  progress?: {
    showProgressBar?: boolean
    allowSaveProgress?: boolean
  }
  limits?: {
    maxFileSize?: number // in MB
    maxFiles?: number
    allowedFileTypes?: string[]
  }
  scoring?: {
    isQuiz?: boolean
    showScore?: boolean
    passingScore?: number
  }
  languages?: string[]
  defaultLanguage?: string
  webhooks?: {
    url?: string
    events?: string[]
  }
}

export interface SurveyResponse {
  id: string
  survey_id: string
  respondent_email: string | null
  started_at: string
  completed_at: string | null
  ip_address: string
}

export interface ResponseAnswer {
  id: string
  response_id: string
  question_id: string
  answer_value: any
}
