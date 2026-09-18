<script setup>
// Kategorie und Suche werden als Query-Parameter an das Backend gereicht.
// Die Rollen-Tag-Filterung passiert bereits serverseitig und ist hier bewusst
// nicht noch einmal abgebildet.
defineProps({
  kategorie: { type: String, default: '' },
  suche: { type: String, default: '' }
})

const emit = defineEmits(['update:kategorie', 'update:suche'])

const KATEGORIEN = [
  { wert: '', text: 'Alle Kategorien' },
  { wert: 'HR', text: 'Personal' },
  { wert: 'IT', text: 'IT' },
  { wert: 'WORKPLACE', text: 'Arbeitsplatz' },
  { wert: 'SECURITY', text: 'Sicherheit' }
]
</script>

<template>
  <form class="filter" role="search" @submit.prevent>
    <div class="filter__feld">
      <label for="filter-kategorie">Kategorie</label>
      <select
        id="filter-kategorie"
        :value="kategorie"
        @change="emit('update:kategorie', $event.target.value)"
      >
        <option v-for="k in KATEGORIEN" :key="k.wert" :value="k.wert">{{ k.text }}</option>
      </select>
    </div>

    <div class="filter__feld">
      <label for="filter-suche">Suche</label>
      <input
        id="filter-suche"
        type="search"
        placeholder="Titel oder Beschreibung"
        :value="suche"
        @input="emit('update:suche', $event.target.value)"
      />
    </div>
  </form>
</template>

<style scoped>
.filter {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.filter__feld {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 0.85rem;
  color: var(--text-leise);
}

select,
input {
  padding: 9px 10px;
  font: inherit;
  color: inherit;
  background: var(--flaeche);
  border: 1px solid var(--rahmen);
  border-radius: 8px;
}

@media (min-width: 720px) {
  .filter {
    grid-template-columns: 220px 1fr;
    align-items: end;
  }
}
</style>
