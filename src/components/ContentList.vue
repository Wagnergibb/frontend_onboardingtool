<script setup>
import ContentCard from './ContentCard.vue'

defineProps({
  inhalte: { type: Array, required: true },
  naechsterId: { type: Number, default: null },
  laedt: { type: Boolean, default: false }
})
</script>

<template>
  <section aria-labelledby="inhalte-titel">
    <h2 id="inhalte-titel">Inhalte für deine Rolle</h2>

    <p v-if="laedt" class="leise" aria-live="polite">Inhalte werden geladen …</p>

    <p v-else-if="!inhalte.length" class="hinweis">
      Für diese Auswahl gibt es keine Inhalte. Setze den Filter zurück oder ändere den Suchbegriff.
    </p>

    <div v-else class="raster">
      <ContentCard
        v-for="inhalt in inhalte"
        :key="inhalt.id"
        :inhalt="inhalt"
        :hervorgehoben="inhalt.id === naechsterId"
      />
    </div>
  </section>
</template>
