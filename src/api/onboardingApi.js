// Zugriff auf das Quarkus-Backend (Wagner).
// Alle Pfade sind relativ, damit der Vite-Proxy greift und kein CORS noetig ist.

const BASE = '/api'

async function request(pfad, optionen = {}) {
  let antwort
  try {
    antwort = await fetch(BASE + pfad, {
      headers: { 'Content-Type': 'application/json' },
      ...optionen
    })
  } catch (fehler) {
    // Netzwerkfehler: Backend laeuft nicht oder ist nicht erreichbar.
    throw new Error('Das Backend ist nicht erreichbar. Laeuft es auf Port 8080?')
  }

  if (antwort.status === 404) {
    throw new Error('Dieser Onboarding-Fall existiert nicht.')
  }
  if (!antwort.ok) {
    throw new Error(`Das Backend hat mit Status ${antwort.status} geantwortet.`)
  }
  if (antwort.status === 204) return null
  return antwort.json()
}

/** Kopfdaten der persoenlichen Ansicht: Person, Rollen-Tags, Buddy, Status, Fortschritt. */
export function ladeDashboard(onboardingId) {
  return request(`/onboarding/${onboardingId}/dashboard`)
}

/**
 * Inhalte eines Falls. Das Backend filtert bereits nach Rollen-Tags und
 * aktiven Inhalten; Kategorie und Suchtext werden als Query-Parameter ergaenzt.
 */
export function ladeInhalte(onboardingId, { kategorie = '', suche = '' } = {}) {
  const params = new URLSearchParams()
  if (kategorie) params.set('category', kategorie)
  if (suche.trim()) params.set('search', suche.trim())
  const query = params.toString()
  return request(`/onboarding/${onboardingId}/content${query ? '?' + query : ''}`)
}

/** Direktlink auf die hinterlegte Ressource (PDF-Download oder Weiterleitung). */
export function ressourcenUrl(inhaltId) {
  return `${BASE}/content/${inhaltId}/resource`
}
