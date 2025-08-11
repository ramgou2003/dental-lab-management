import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('https://tofoatpggdudjvgoixwp.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }
    })
  }),

  // Mock Supabase REST API endpoints
  http.get('https://tofoatpggdudjvgoixwp.supabase.co/rest/v1/patients', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  http.get('https://tofoatpggdudjvgoixwp.supabase.co/rest/v1/leads', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        status: 'new',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  // Mock AI API endpoints
  http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{
        message: {
          content: 'Mock AI response for testing'
        }
      }]
    })
  }),

  // Mock Gemini API
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: 'Mock Gemini response for testing'
          }]
        }
      }]
    })
  })
]
