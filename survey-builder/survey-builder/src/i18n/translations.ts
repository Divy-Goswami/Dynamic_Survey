// Translation system for multi-language support

export interface Translations {
  [key: string]: {
    [lang: string]: string
  }
}

export const translations: Translations = {
  'survey.title': {
    en: 'Survey Title',
    es: 'Título de la Encuesta',
    fr: 'Titre de l\'Enquête',
    de: 'Umfrage-Titel',
    zh: '调查标题',
    ja: '調査タイトル',
  },
  'survey.description': {
    en: 'Description',
    es: 'Descripción',
    fr: 'Description',
    de: 'Beschreibung',
    zh: '描述',
    ja: '説明',
  },
  'question.add': {
    en: 'Add Question',
    es: 'Agregar Pregunta',
    fr: 'Ajouter une Question',
    de: 'Frage Hinzufügen',
    zh: '添加问题',
    ja: '質問を追加',
  },
  'question.text': {
    en: 'Text Input',
    es: 'Entrada de Texto',
    fr: 'Saisie de Texte',
    de: 'Texteingabe',
    zh: '文本输入',
    ja: 'テキスト入力',
  },
  'question.multiple_choice': {
    en: 'Multiple Choice',
    es: 'Opción Múltiple',
    fr: 'Choix Multiple',
    de: 'Multiple Choice',
    zh: '多选题',
    ja: '複数選択',
  },
  'question.required': {
    en: 'Required',
    es: 'Obligatorio',
    fr: 'Obligatoire',
    de: 'Erforderlich',
    zh: '必填',
    ja: '必須',
  },
  'survey.submit': {
    en: 'Submit Survey',
    es: 'Enviar Encuesta',
    fr: 'Soumettre l\'Enquête',
    de: 'Umfrage Absenden',
    zh: '提交调查',
    ja: '調査を送信',
  },
  'survey.thank_you': {
    en: 'Thank You!',
    es: '¡Gracias!',
    fr: 'Merci!',
    de: 'Vielen Dank!',
    zh: '谢谢！',
    ja: 'ありがとうございます！',
  },
  'survey.submitted': {
    en: 'Your response has been submitted successfully.',
    es: 'Su respuesta ha sido enviada con éxito.',
    fr: 'Votre réponse a été soumise avec succès.',
    de: 'Ihre Antwort wurde erfolgreich übermittelt.',
    zh: '您的回复已成功提交。',
    ja: '回答が正常に送信されました。',
  },
}

export function getTranslation(key: string, language: string = 'en'): string {
  const translation = translations[key]
  if (!translation) return key
  return translation[language] || translation['en'] || key
}

export function setLanguage(language: string) {
  localStorage.setItem('survey_language', language)
}

export function getLanguage(): string {
  return localStorage.getItem('survey_language') || 'en'
}

