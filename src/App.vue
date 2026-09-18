<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { ladeDashboard, ladeInhalte } from './api/onboardingApi.js'
import PersonHeader from './components/PersonHeader.vue'
import ContentFilters from './components/ContentFilters.vue'
import ContentList from './components/ContentList.vue'

// Im MVP gibt es noch keine Anmeldung. Der Fall wird deshalb aus der URL
// gelesen (?fall=1) und faellt sonst auf den ersten Fall zurueck.
const onboardingId = Number(new URLSearchParams(location.search).get('fall')) || 1

const dashboard = ref(null)
const inhalte = ref([])
const kategorie = ref('')
const suche = ref('')
const laedtSeite = ref(true)
const laedtInhalte = ref(false)
const fehler = ref('')

async function ladeAlles() {
  laedtSeite.value = true
  fehler.value = ''
  try {
    dashboard.value = await ladeDashboard(onboardingId)
    inhalte.value = await ladeInhalte(onboardingId, { kategorie: kategorie.value, suche: suche.value })
  } catch (e) {
    fehler.value = e.message
  } finally {
    laedtSeite.value = false
  }
}

async function ladeNurInhalte() {
  laedtInhalte.value = true
  fehler.value = ''
  try {
    inhalte.value = await ladeInhalte(onboardingId, { kategorie: kategorie.value, suche: suche.value })
  } catch (e) {
    fehler.value = e.message
  } finally {
    laedtInhalte.value = false
  }
}

// Die Suche laeuft serverseitig. Ohne Verzoegerung entstuende pro Tastendruck
// eine Anfrage, deshalb wird 300 ms gewartet.
let sucheTimer = null
watch(suche, () => {
  clearTimeout(sucheTimer)
  sucheTimer = setTimeout(ladeNurInhalte, 300)
})

watch(kategorie, ladeNurInhalte)

onMounted(ladeAlles)
onBeforeUnmount(() => clearTimeout(sucheTimer))
</script>

<template>
  <div class="seite">
    <p v-if="laedtSeite" class="hinweis" aria-live="polite">Ansicht wird geladen …</p>

    <p v-else-if="fehler && !dashboard" class="hinweis hinweis--fehler" role="alert">
      {{ fehler }}
    </p>

    <template v-else-if="dashboard">
      <PersonHeader :dashboard="dashboard" />

      <main class="karte">
        <ContentFilters
          v-model:kategorie="kategorie"
          v-model:suche="suche"
        />

        <p v-if="fehler" class="hinweis hinweis--fehler" role="alert">{{ fehler }}</p>

        <ContentList
          :inhalte="inhalte"
          :naechster-id="dashboard.nextContent?.id ?? null"
          :laedt="laedtInhalte"
        />
      </main>
    </template>
  </div>
</template>
