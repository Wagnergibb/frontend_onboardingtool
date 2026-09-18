<script setup>
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  dashboard: { type: Object, required: true }
})

const STATUS_TEXT = {
  PREPARED: 'Vorbereitet',
  ACTIVE: 'Aktiv',
  IN_PROGRESS: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen'
}

// Das Backend liefert firstName/lastName am Onboarding-Fall derzeit als null,
// wenn der Fall ueber POST /api/users angelegt wurde. Bis das behoben ist,
// weicht die Ansicht auf die Funktion aus, statt "null null" anzuzeigen.
const anzeigeName = computed(() => {
  const teile = [props.dashboard.firstName, props.dashboard.lastName].filter(Boolean)
  return teile.length ? teile.join(' ') : null
})

const statusText = computed(() => STATUS_TEXT[props.dashboard.status] ?? props.dashboard.status ?? 'Unbekannt')
</script>

<template>
  <header class="karte">
    <p class="leise">Deine Onboarding-Übersicht</p>
    <h1>{{ anzeigeName ?? dashboard.function ?? 'Onboarding' }}</h1>

    <p v-if="anzeigeName && dashboard.function" class="leise">{{ dashboard.function }}</p>
    <p v-else-if="!anzeigeName" class="leise">Name im Onboarding-Fall noch nicht hinterlegt</p>

    <dl class="fakten">
      <div>
        <dt>Status</dt>
        <dd>{{ statusText }}</dd>
      </div>
      <div>
        <dt>Ansprechperson</dt>
        <dd>{{ dashboard.buddy || 'Noch nicht zugewiesen' }}</dd>
      </div>
      <div>
        <dt>Rollen-Tags</dt>
        <dd>
          <span v-for="tag in dashboard.roleTags" :key="tag" class="tag">{{ tag }}</span>
          <span v-if="!dashboard.roleTags?.length" class="leise">keine</span>
        </dd>
      </div>
    </dl>

    <ProgressBar
      :erledigt="dashboard.completed"
      :gesamt="dashboard.totalRelevant"
      :prozent="dashboard.progressPercentage"
    />
  </header>
</template>

<style scoped>
.fakten {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}

.fakten dt {
  font-size: 0.82rem;
  color: var(--text-leise);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.fakten dd {
  margin: 2px 0 0;
}

@media (min-width: 720px) {
  .fakten {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
