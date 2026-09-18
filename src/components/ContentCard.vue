<script setup>
import { computed } from 'vue'
import { ressourcenUrl } from '../api/onboardingApi.js'

const props = defineProps({
  inhalt: { type: Object, required: true },
  hervorgehoben: { type: Boolean, default: false }
})

const KATEGORIE_TEXT = {
  HR: 'Personal',
  IT: 'IT',
  WORKPLACE: 'Arbeitsplatz',
  SECURITY: 'Sicherheit'
}

const kategorieText = computed(() => KATEGORIE_TEXT[props.inhalt.category] ?? props.inhalt.category)
const istPdf = computed(() => props.inhalt.type === 'PDF')
const url = computed(() => ressourcenUrl(props.inhalt.id))
</script>

<template>
  <article class="inhalt" :class="{ 'inhalt--naechster': hervorgehoben }">
    <p v-if="hervorgehoben" class="inhalt__marke">Als Nächstes</p>

    <div class="inhalt__kopf">
      <h3>{{ inhalt.title }}</h3>
      <span v-if="inhalt.completed" class="abzeichen">Erledigt</span>
    </div>

    <p v-if="inhalt.description" class="inhalt__text">{{ inhalt.description }}</p>

    <!-- Kategorie und Rollen-Tags sind zwei verschiedene Dinge und koennen
         denselben Namen tragen (z. B. "IT"). Sie werden deshalb getrennt
         beschriftet und unterschiedlich dargestellt. -->
    <p class="inhalt__meta">
      <span class="kategorie">{{ kategorieText }}</span>
      <span class="rollen">
        <span class="rollen__text">Für:</span>
        <span v-for="tag in inhalt.roleTags" :key="tag" class="tag">{{ tag }}</span>
        <span v-if="!inhalt.roleTags?.length" class="tag">alle Rollen</span>
      </span>
    </p>

    <!-- Externe Links werden in einem neuen Tab und ohne Referrer geoeffnet. -->
    <a
      class="inhalt__link"
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ istPdf ? 'PDF öffnen' : 'Link öffnen' }}
      <span class="visuell-versteckt">: {{ inhalt.title }}</span>
    </a>
  </article>
</template>

<style scoped>
.inhalt {
  background: var(--flaeche);
  border: 1px solid var(--rahmen);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inhalt--naechster {
  border-color: var(--akzent);
  box-shadow: 0 0 0 3px var(--akzent-leicht);
}

.inhalt__marke {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--akzent);
}

.inhalt__kopf {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}

h3 {
  margin: 0;
  font-size: 1.02rem;
}

.abzeichen {
  flex-shrink: 0;
  padding: 2px 10px;
  font-size: 0.78rem;
  border-radius: 999px;
  background: var(--erledigt-leicht);
  color: var(--erledigt);
}

.inhalt__text {
  margin: 0;
  color: var(--text-leise);
  font-size: 0.93rem;
}

.inhalt__meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
}

.kategorie {
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  background: var(--text);
  color: var(--flaeche);
}

.rollen {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}

.rollen__text {
  margin-right: 2px;
  font-size: 0.8rem;
  color: var(--text-leise);
}

.inhalt__link {
  align-self: start;
  margin-top: 4px;
  color: var(--akzent);
  font-weight: 600;
  text-decoration: none;
}

.inhalt__link:hover {
  text-decoration: underline;
}

.visuell-versteckt {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (min-width: 720px) {
  .inhalt {
    margin-bottom: 0;
  }
}
</style>
