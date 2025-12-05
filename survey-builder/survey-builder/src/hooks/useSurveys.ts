import { useState, useEffect } from 'react'
import { supabase, Survey } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useSurveys() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchSurveys() {
    if (!user) {
      setSurveys([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('surveys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setSurveys(data || [])
    } catch (err: any) {
      console.error('Error fetching surveys:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createSurvey(title: string, description: string) {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        user_id: user.id,
        title,
        description,
        settings: {},
        is_published: false,
      })
      .select()
      .maybeSingle()

    if (error) throw error
    
    if (data) {
      setSurveys(prev => [data, ...prev])
    }
    
    return data
  }

  async function updateSurvey(id: string, updates: Partial<Survey>) {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error

    if (data) {
      setSurveys(prev => prev.map(s => s.id === id ? data : s))
    }

    return data
  }

  async function deleteSurvey(id: string) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) throw error

    setSurveys(prev => prev.filter(s => s.id !== id))
  }

  useEffect(() => {
    fetchSurveys()
  }, [user])

  return {
    surveys,
    loading,
    error,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
  }
}
