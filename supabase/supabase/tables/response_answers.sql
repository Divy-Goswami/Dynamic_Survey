CREATE TABLE response_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer_value JSONB
);