<script setup>
import { computed } from 'vue'

const props = defineProps({
  erledigt: { type: Number, required: true },
  gesamt: { type: Number, required: true },
  prozent: { type: Number, required: true }
})

const gerundet = computed(() => Math.round(props.prozent))

// Das Backend kann derzeit Werte ueber 100 % liefern, wenn erledigte Inhalte
// nachtraeglich deaktiviert werden. Der Balken wird deshalb begrenzt, damit das
// Layout nicht bricht. Die echten Zahlen bleiben sichtbar.
const balkenBreite = computed(() => Math.min(100, Math.max(0, props.prozent)))
const unstimmig = computed(() => props.erledigt > props.gesamt)
</script>

<template>
  <div class="fortschritt">
    <div class="fortschritt__kopf">
      <span>Fortschritt</span>
      <span>{{ erledigt }} von {{ gesamt }} erledigt ({{ gerundet }} %)</span>
    </div>

    <div
      class="balken"
      role="progressbar"
      :aria-valuenow="gerundet"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`Onboarding zu ${gerundet} Prozent erledigt`"
    >
      <div class="balken__fuellung" :style="{ width: balkenBreite + '%' }"></div>
    </div>

    <p v-if="unstimmig" class="leise warnung">
      Hinweis: Es sind mehr Inhalte als erledigt erfasst, als aktuell für deine Rolle
      relevant sind. Vermutlich wurden erledigte Inhalte nachträglich deaktiviert.
    </p>
  </div>
</template>

<style scoped>
.fortschritt__kopf {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.balken {
  height: 10px;
  border-radius: 999px;
  background: var(--grund);
  border: 1px solid var(--rahmen);
  overflow: hidden;
}

.balken__fuellung {
  height: 100%;
  background: var(--akzent);
  transition: width 0.25s ease;
}

.warnung {
  margin: 8px 0 0;
  color: #8a5a00;
}
</style>
