CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL,
    respondent_email VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45)
);