<template>
  <footer class="footer">
    <div class="container">
      <p>{{ copyrightLabel }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProfileIdentity } from '../../content/data/profile'

const { t } = useI18n()
const profileIdentity = getProfileIdentity()
const currentYear = new Date().getFullYear()
const copyrightLabel = computed(() => t('footer.copyright', {
  year: currentYear,
  name: profileIdentity.fullName,
}))
</script>

<style scoped src="./Footer.css"></style>
