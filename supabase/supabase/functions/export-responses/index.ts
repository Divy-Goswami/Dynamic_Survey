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
        const { surveyId, format = 'json' } = await req.json();

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

        const questions = await questionsResult.json();

        // Get responses
        const responsesResult = await fetch(
            `${supabaseUrl}/rest/v1/survey_responses?survey_id=eq.${surveyId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const responses = await responsesResult.json();
        const responseIds = responses.map(r => r.id).join(',');

        let exportData: any[] = [];

        if (responseIds) {
            // Get all answers
            const answersResult = await fetch(
                `${supabaseUrl}/rest/v1/response_answers?response_id=in.(${responseIds})&select=*`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const answers = await answersResult.json();

            // Build export data
            exportData = responses.map(response => {
                const row: any = {
                    'Response ID': response.id,
                    'Respondent Email': response.respondent_email || 'Anonymous',
                    'Started At': response.started_at,
                    'Completed At': response.completed_at,
                    'IP Address': response.ip_address
                };

                // Add answers for each question
                questions.forEach(question => {
                    const answer = answers.find(
                        a => a.response_id === response.id && a.question_id === question.id
                    );
                    
                    if (answer) {
                        const value = answer.answer_value;
                        row[question.question_text] = Array.isArray(value) 
                            ? value.join(', ') 
                            : typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : value;
                    } else {
                        row[question.question_text] = '';
                    }
                });

                return row;
            });
        }

        if (format === 'csv') {
            // Convert to CSV
            if (exportData.length === 0) {
                return new Response('No data to export', {
                    headers: { ...corsHeaders, 'Content-Type': 'text/csv' }
                });
            }

            const headers = Object.keys(exportData[0]);
            const csvRows = [
                headers.join(','),
                ...exportData.map(row => 
                    headers.map(header => {
                        const value = row[header] || '';
                        // Escape quotes and wrap in quotes if contains comma or quote
                        const escaped = String(value).replace(/"/g, '""');
                        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
                    }).join(',')
                )
            ];

            const csvContent = csvRows.join('\n');

            return new Response(csvContent, {
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="survey-${surveyId}-responses.csv"`
                }
            });
        } else {
            // Return JSON
            return new Response(JSON.stringify({
                data: {
                    survey: surveys[0],
                    questions,
                    responses: exportData
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Export responses error:', error);

        const errorResponse = {
            error: {
                code: 'EXPORT_RESPONSES_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
