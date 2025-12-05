-- Enable RLS on all tables
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;

-- Surveys policies
-- Allow public to read published surveys
CREATE POLICY "Public can read published surveys" ON surveys
  FOR SELECT
  USING (is_published = true);

-- Allow users to read their own surveys
CREATE POLICY "Users can read own surveys" ON surveys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to create surveys
CREATE POLICY "Authenticated users can create surveys" ON surveys
  FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'anon', 'service_role') AND auth.uid() = user_id);

-- Allow users to update their own surveys
CREATE POLICY "Users can update own surveys" ON surveys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own surveys
CREATE POLICY "Users can delete own surveys" ON surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Survey Questions policies
-- Allow public to read questions from published surveys
CREATE POLICY "Public can read questions from published surveys" ON survey_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.is_published = true
    )
  );

-- Allow survey owners to read their questions
CREATE POLICY "Survey owners can read their questions" ON survey_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Allow survey owners to insert questions
CREATE POLICY "Survey owners can insert questions" ON survey_questions
  FOR INSERT
  WITH CHECK (
    auth.role() IN ('authenticated', 'anon', 'service_role')
    AND EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Allow survey owners to update questions
CREATE POLICY "Survey owners can update questions" ON survey_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Allow survey owners to delete questions
CREATE POLICY "Survey owners can delete questions" ON survey_questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Survey Responses policies
-- Allow survey owners to read responses to their surveys
CREATE POLICY "Survey owners can read responses" ON survey_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_responses.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Allow anyone (anon and authenticated) to submit responses
CREATE POLICY "Anyone can submit responses" ON survey_responses
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- Response Answers policies
-- Allow survey owners to read answers
CREATE POLICY "Survey owners can read answers" ON response_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN surveys s ON s.id = sr.survey_id
      WHERE sr.id = response_answers.response_id 
      AND s.user_id = auth.uid()
    )
  );

-- Allow anyone to insert answers
CREATE POLICY "Anyone can insert answers" ON response_answers
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
