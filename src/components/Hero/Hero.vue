<template>
  <section id="home" class="hero">
    <div class="hero-content">
      <div class="hero-main">
        <div class="hero-copy">
          <!-- <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p> -->
          <p class="hero-about">
            <template v-for="(segment, index) in profileDescriptionSegments" :key="`${segment.type}-${index}`">
              <a
                v-if="segment.type === 'link'"
                class="inline-link"
                :href="segment.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ segment.label }}
              </a>
              <span v-else>{{ segment.value }}</span>
            </template>
          </p>
        </div>
        <img class="hero-photo" :src="profilePhoto" :alt="heroPhotoAlt" />
      </div>
      <button
        class="scroll-next-btn"
        type="button"
        aria-label="Scroll to next section"
        @click="scrollToNextSection"
      >
        <span class="scroll-next-icon" aria-hidden="true">↓</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getProfileContent,
  getProfileIdentity,
  getProfilePhoto,
  parseRichTextSegments,
} from '../../content/data/profile'
import { getSupportedLocale } from '../../content/locale'

const { locale } = useI18n()
const profileIdentity = getProfileIdentity()
const profilePhoto = getProfilePhoto()

const currentLocale = computed(() => getSupportedLocale(locale.value))
const profileDescription = computed(() => getProfileContent(currentLocale.value).description)
const profileDescriptionSegments = computed(() => parseRichTextSegments(profileDescription.value))
const heroPhotoAlt = computed(() => (
  currentLocale.value === 'fr'
    ? `Portrait de ${profileIdentity.fullName}`
    : `Portrait of ${profileIdentity.fullName}`
))

const scrollToNextSection = () => {
  const skillsSection = document.getElementById('skills')

  if (skillsSection) {
    skillsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  const heroSection = document.getElementById('home')
  const nextSection = heroSection?.nextElementSibling as HTMLElement | null
  nextSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped src="./Hero.css"></style>
