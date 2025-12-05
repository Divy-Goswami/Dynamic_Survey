CREATE TABLE survey_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options TEXT[] DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT false,
    help_text TEXT,
    skip_logic JSONB DEFAULT '{}'
);