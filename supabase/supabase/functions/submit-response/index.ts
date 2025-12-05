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
        const { surveyId, answers, respondentEmail } = await req.json();

        if (!surveyId || !answers || !Array.isArray(answers)) {
            throw new Error('Survey ID and answers array are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get IP address from request
        const ipAddress = req.headers.get('x-forwarded-for') || 
                         req.headers.get('x-real-ip') || 
                         'unknown';

        // Create response record
        const responseData = {
            survey_id: surveyId,
            respondent_email: respondentEmail || null,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            ip_address: ipAddress
        };

        const responseResult = await fetch(`${supabaseUrl}/rest/v1/survey_responses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(responseData)
        });

        if (!responseResult.ok) {
            const errorText = await responseResult.text();
            throw new Error(`Failed to create response: ${errorText}`);
        }

        const responseRecords = await responseResult.json();
        const responseId = responseRecords[0].id;

        // Insert all answers
        const answerRecords = answers.map(answer => ({
            response_id: responseId,
            question_id: answer.questionId,
            answer_value: answer.value
        }));

        const answersResult = await fetch(`${supabaseUrl}/rest/v1/response_answers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(answerRecords)
        });

        if (!answersResult.ok) {
            const errorText = await answersResult.text();
            throw new Error(`Failed to insert answers: ${errorText}`);
        }

        // Get survey settings for webhook
        const surveyResult = await fetch(
            `${supabaseUrl}/rest/v1/surveys?id=eq.${surveyId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const surveys = await surveyResult.json();
        const survey = surveys[0];

        // Fire webhook if configured
        if (survey?.settings?.webhooks?.url && 
            survey.settings.webhooks.events?.includes('response.completed')) {
            try {
                await fetch(survey.settings.webhooks.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event: 'response.completed',
                        surveyId: surveyId,
                        responseId: responseId,
                        timestamp: new Date().toISOString(),
                        data: {
                            response: responseRecords[0],
                            answers: answerRecords,
                        }
                    })
                });
            } catch (webhookError) {
                console.error('Webhook error:', webhookError);
                // Don't fail the request if webhook fails
            }
        }

        return new Response(JSON.stringify({
            data: {
                responseId,
                message: 'Survey response submitted successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Submit response error:', error);

        const errorResponse = {
            error: {
                code: 'SUBMIT_RESPONSE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
