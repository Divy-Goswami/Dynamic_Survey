Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { surveyId } = await req.json();

        if (!surveyId) {
            throw new Error('Survey ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify user owns this survey
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Verify ownership
        const surveyResult = await fetch(
            `${supabaseUrl}/rest/v1/surveys?id=eq.${surveyId}&user_id=eq.${userId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!surveyResult.ok) {
            throw new Error('Failed to verify survey ownership');
        }

        const surveys = await surveyResult.json();
        if (surveys.length === 0) {
            throw new Error('Survey not found or access denied');
        }

        // Get total responses
        const responsesResult = await fetch(
            `${supabaseUrl}/rest/v1/survey_responses?survey_id=eq.${surveyId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!responsesResult.ok) {
            throw new Error('Failed to fetch responses');
        }

        const responses = await responsesResult.json();
        const totalResponses = responses.length;
        const completedResponses = responses.filter(r => r.completed_at).length;

        // Get questions
        const questionsResult = await fetch(
            `${supabaseUrl}/rest/v1/survey_questions?survey_id=eq.${surveyId}&select=*&order=order_index.asc`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!questionsResult.ok) {
            throw new Error('Failed to fetch questions');
        }

        const questions = await questionsResult.json();

        // Get all answers
        const responseIds = responses.map(r => r.id).join(',');
        let questionAnalytics = [];

        if (responseIds) {
            const answersResult = await fetch(
                `${supabaseUrl}/rest/v1/response_answers?response_id=in.(${responseIds})&select=*`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            if (!answersResult.ok) {
                throw new Error('Failed to fetch answers');
            }

            const answers = await answersResult.json();

            // Aggregate answers by question
            questionAnalytics = questions.map(question => {
                const questionAnswers = answers.filter(a => a.question_id === question.id);
                
                let analytics: any = {
                    questionId: question.id,
                    questionText: question.question_text,
                    questionType: question.question_type,
                    totalResponses: questionAnswers.length
                };

                // Calculate type-specific analytics
                if (['multiple_choice', 'dropdown', 'checkbox'].includes(question.question_type)) {
                    // Count occurrences of each option
                    const optionCounts: Record<string, number> = {};
                    questionAnswers.forEach(answer => {
                        const value = answer.answer_value;
                        if (Array.isArray(value)) {
                            // Checkbox type
                            value.forEach(v => {
                                optionCounts[v] = (optionCounts[v] || 0) + 1;
                            });
                        } else {
                            optionCounts[value] = (optionCounts[value] || 0) + 1;
                        }
                    });
                    analytics.optionCounts = optionCounts;
                } else if (question.question_type === 'rating') {
                    // Calculate average rating
                    const ratings = questionAnswers.map(a => Number(a.answer_value) || 0);
                    const average = ratings.length > 0 
                        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
                        : 0;
                    analytics.averageRating = Math.round(average * 100) / 100;
                    analytics.ratingDistribution = {};
                    ratings.forEach(rating => {
                        analytics.ratingDistribution[rating] = (analytics.ratingDistribution[rating] || 0) + 1;
                    });
                } else if (question.question_type === 'ranking') {
                    // Calculate average position for each option
                    const optionPositions: Record<string, number[]> = {};
                    questionAnswers.forEach(answer => {
                        const ranking = answer.answer_value;
                        if (Array.isArray(ranking)) {
                            ranking.forEach((option: string, index: number) => {
                                if (!optionPositions[option]) {
                                    optionPositions[option] = [];
                                }
                                optionPositions[option].push(index + 1); // Position (1-based)
                            });
                        }
                    });
                    
                    const averagePositions: Record<string, number> = {};
                    Object.keys(optionPositions).forEach(option => {
                        const positions = optionPositions[option];
                        const average = positions.length > 0
                            ? positions.reduce((sum, p) => sum + p, 0) / positions.length
                            : 0;
                        averagePositions[option] = Math.round(average * 100) / 100;
                    });
                    
                    analytics.averagePositions = averagePositions;
                    analytics.optionPositions = optionPositions;
                } else if (question.question_type === 'text') {
                    // Just list all text responses
                    analytics.responses = questionAnswers.map(a => a.answer_value);
                }

                return analytics;
            });
        }

        return new Response(JSON.stringify({
            data: {
                totalResponses,
                completedResponses,
                completionRate: totalResponses > 0 
                    ? Math.round((completedResponses / totalResponses) * 100) 
                    : 0,
                questionAnalytics,
                responses: responses.map(r => ({
                    id: r.id,
                    respondentEmail: r.respondent_email,
                    completedAt: r.completed_at,
                    startedAt: r.started_at
                }))
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get analytics error:', error);

        const errorResponse = {
            error: {
                code: 'GET_ANALYTICS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
