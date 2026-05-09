import axios from 'axios'

const BASE = 'http://localhost:8000'

export const api = {
  profile:    (user)         => axios.get(`${BASE}/api/profile/${user}`),
  deep:       (user)         => axios.get(`${BASE}/api/deep/${user}`),
  compare:    (user1, user2) => axios.get(`${BASE}/api/compare/${user1}/${user2}`),
  academic:   (user)         => axios.get(`${BASE}/api/academic/${user}`),
  predict:    (user)         => axios.get(`${BASE}/api/predict/${user}`),
  ai_summary: (user)         => axios.get(`${BASE}/api/ai/summary/${user}`),
  ai_roast:   (user)         => axios.get(`${BASE}/api/ai/roast/${user}`),
  ai_career:  (user)         => axios.get(`${BASE}/api/ai/career/${user}`),
  health:     ()             => axios.get(`${BASE}/api/health`),
}