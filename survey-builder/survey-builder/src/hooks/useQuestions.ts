import { useState, useEffect } from 'react'
import { supabase, SurveyQuestion } from '@/lib/supabase'

export function useQuestions(surveyId: string | undefined) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchQuestions() {
    if (!surveyId) {
      setQuestions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      if (fetchError) throw fetchError

      setQuestions(data || [])
    } catch (err: any) {
      console.error('Error fetching questions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addQuestion(question: Omit<SurveyQuestion, 'id'>) {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(question)
      .select()
      .maybeSingle()

    if (error) throw error

    if (data) {
      setQuestions(prev => [...prev, data])
    }

    return data
  }

  async function updateQuestion(id: string, updates: Partial<SurveyQuestion>) {
    const { data, error } = await supabase
      .from('survey_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error

    if (data) {
      setQuestions(prev => prev.map(q => q.id === id ? data : q))
    }

    return data
  }

  async function deleteQuestion(id: string) {
    const { error } = await supabase
      .from('survey_questions')
      .delete()
      .eq('id', id)

    if (error) throw error

    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function reorderQuestions(reorderedQuestions: SurveyQuestion[]) {
    // Update order_index for all questions
    const updates = reorderedQuestions.map((q, index) => ({
      id: q.id,
      order_index: index,
    }))

    for (const update of updates) {
      await supabase
        .from('survey_questions')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    }

    setQuestions(reorderedQuestions)
  }

  useEffect(() => {
    fetchQuestions()
  }, [surveyId])

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  }
}
