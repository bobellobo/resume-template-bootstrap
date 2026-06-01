<template>
  <section id="contact" class="contact section-block">
    <div class="container">
      <h2 class="section-title">{{ $t('contact.title') }}</h2>
      <p>{{ $t('contact.description') }}</p>
      <div class="contact-links">
        <a
          v-for="link in contactLinks"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
          :target="isExternalUrl(link.url) ? '_blank' : undefined"
          :rel="isExternalUrl(link.url) ? 'noreferrer' : undefined"
          class="contact-button"
        >
          {{ link.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProfileContactLinks } from '../../content/data/profile'
import { getSupportedLocale } from '../../content/locale'

const { locale } = useI18n()

const currentLocale = computed(() => getSupportedLocale(locale.value))
const contactLinks = computed(() => getProfileContactLinks(currentLocale.value))

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url)
</script>

<style scoped src="./Contact.css"></style>
