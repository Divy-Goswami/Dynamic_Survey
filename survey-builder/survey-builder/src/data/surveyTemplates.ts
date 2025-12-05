import { Survey, SurveyQuestion } from '@/lib/supabase'

export interface SurveyTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  survey: Partial<Survey>
  questions: Partial<SurveyQuestion>[]
}

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Survey',
    description: 'Measure customer satisfaction and gather feedback',
    category: 'Business',
    icon: '⭐',
    survey: {
      title: 'Customer Satisfaction Survey',
      description: 'We value your feedback! Please take a few minutes to share your experience.',
      settings: {
        theme: {
          primaryColor: '#1976d2',
        },
      },
    },
    questions: [
      {
        question_text: 'How satisfied are you with our service?',
        question_type: 'rating',
        options: [],
        is_required: true,
        help_text: 'Rate from 1 to 5 stars',
        order_index: 0,
      },
      {
        question_text: 'What did you like most about our service?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 1,
      },
      {
        question_text: 'What could we improve?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 2,
      },
      {
        question_text: 'How likely are you to recommend us to others?',
        question_type: 'multiple_choice',
        options: ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'],
        is_required: true,
        order_index: 3,
      },
    ],
  },
  {
    id: 'employee-feedback',
    name: 'Employee Feedback Survey',
    description: 'Collect employee feedback and engagement insights',
    category: 'HR',
    icon: '👥',
    survey: {
      title: 'Employee Feedback Survey',
      description: 'Your honest feedback helps us create a better workplace.',
      settings: {
        theme: {
          primaryColor: '#2e7d32',
        },
      },
    },
    questions: [
      {
        question_text: 'How would you rate your overall job satisfaction?',
        question_type: 'rating',
        options: [],
        is_required: true,
        order_index: 0,
      },
      {
        question_text: 'What aspects of your job do you enjoy most?',
        question_type: 'checkbox',
        options: ['Work-life balance', 'Team collaboration', 'Career growth', 'Compensation', 'Company culture', 'Other'],
        is_required: false,
        order_index: 1,
      },
      {
        question_text: 'What challenges do you face in your role?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 2,
      },
      {
        question_text: 'How would you rate your manager?',
        question_type: 'rating',
        options: [],
        is_required: false,
        order_index: 3,
      },
    ],
  },
  {
    id: 'event-feedback',
    name: 'Event Feedback Form',
    description: 'Gather feedback after events, webinars, or conferences',
    category: 'Events',
    icon: '🎉',
    survey: {
      title: 'Event Feedback',
      description: 'Thank you for attending! Please share your thoughts.',
      settings: {
        theme: {
          primaryColor: '#9c27b0',
        },
      },
    },
    questions: [
      {
        question_text: 'How would you rate the event overall?',
        question_type: 'rating',
        options: [],
        is_required: true,
        order_index: 0,
      },
      {
        question_text: 'Which sessions did you attend?',
        question_type: 'checkbox',
        options: ['Opening Keynote', 'Session A', 'Session B', 'Session C', 'Closing Remarks'],
        is_required: false,
        order_index: 1,
      },
      {
        question_text: 'What was your favorite part of the event?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 2,
      },
      {
        question_text: 'Would you attend again?',
        question_type: 'multiple_choice',
        options: ['Yes, definitely', 'Probably', 'Maybe', 'Probably not', 'No'],
        is_required: true,
        order_index: 3,
      },
    ],
  },
  {
    id: 'product-feedback',
    name: 'Product Feedback Survey',
    description: 'Collect user feedback on products or features',
    category: 'Product',
    icon: '📦',
    survey: {
      title: 'Product Feedback',
      description: 'Help us improve our product by sharing your experience.',
      settings: {
        theme: {
          primaryColor: '#f57c00',
        },
      },
    },
    questions: [
      {
        question_text: 'How easy is our product to use?',
        question_type: 'rating',
        options: [],
        is_required: true,
        order_index: 0,
      },
      {
        question_text: 'What features do you use most?',
        question_type: 'checkbox',
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
        is_required: false,
        order_index: 1,
      },
      {
        question_text: 'What features would you like to see?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 2,
      },
      {
        question_text: 'How likely are you to continue using our product?',
        question_type: 'multiple_choice',
        options: ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'],
        is_required: true,
        order_index: 3,
      },
    ],
  },
  {
    id: 'quiz-template',
    name: 'Quiz Template',
    description: 'Create quizzes with scoring and correct answers',
    category: 'Education',
    icon: '📚',
    survey: {
      title: 'Knowledge Quiz',
      description: 'Test your knowledge with this quiz!',
      settings: {
        theme: {
          primaryColor: '#d32f2f',
        },
        scoring: {
          isQuiz: true,
          showScore: true,
          passingScore: 70,
        },
      },
    },
    questions: [
      {
        question_text: 'What is the capital of France?',
        question_type: 'multiple_choice',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        is_required: true,
        score: 10,
        order_index: 0,
      },
      {
        question_text: 'Which planet is closest to the Sun?',
        question_type: 'multiple_choice',
        options: ['Venus', 'Mercury', 'Earth', 'Mars'],
        is_required: true,
        score: 10,
        order_index: 1,
      },
      {
        question_text: 'Explain the concept of gravity in your own words.',
        question_type: 'text',
        options: [],
        is_required: false,
        score: 20,
        order_index: 2,
      },
    ],
  },
  {
    id: 'market-research',
    name: 'Market Research Survey',
    description: 'Conduct market research and gather consumer insights',
    category: 'Research',
    icon: '📊',
    survey: {
      title: 'Market Research Survey',
      description: 'Your opinions help shape future products and services.',
      settings: {
        theme: {
          primaryColor: '#0288d1',
        },
      },
    },
    questions: [
      {
        question_text: 'What is your age range?',
        question_type: 'multiple_choice',
        options: ['18-24', '25-34', '35-44', '45-54', '55+'],
        is_required: true,
        order_index: 0,
      },
      {
        question_text: 'What products are you interested in?',
        question_type: 'checkbox',
        options: ['Product A', 'Product B', 'Product C', 'Product D'],
        is_required: false,
        order_index: 1,
      },
      {
        question_text: 'Rank these features by importance',
        question_type: 'ranking',
        options: ['Price', 'Quality', 'Design', 'Customer Service'],
        is_required: true,
        order_index: 2,
      },
      {
        question_text: 'What factors influence your purchasing decisions?',
        question_type: 'text',
        options: [],
        is_required: false,
        order_index: 3,
      },
    ],
  },
]

export function getTemplatesByCategory(): Record<string, SurveyTemplate[]> {
  return surveyTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, SurveyTemplate[]>)
}

