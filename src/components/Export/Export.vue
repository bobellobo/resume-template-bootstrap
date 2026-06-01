<template>
  <main :class="['resume-page', { 'print-preview': isPrintPreview }]">
    <div class="resume-toolbar" role="toolbar" :aria-label="$t('exportView.actionsLabel')">
      <a class="toolbar-link" href="/resume/">{{ $t('exportView.backToPortfolio') }}</a>
      <button
        type="button"
        class="toolbar-button"
        :title="languageSwitchTitle"
        :aria-label="languageSwitchTitle"
        @click="toggleLanguage"
      >
        {{ languageSwitchLabel }}
      </button>
      <button
        type="button"
        :class="['toolbar-button', { 'toolbar-button-active': isPrintPreview }]"
        :title="printPreviewTitle"
        :aria-label="printPreviewTitle"
        @click="togglePrintPreview"
      >
        {{ printPreviewLabel }}
      </button>
      <button type="button" class="toolbar-button" @click="printExport">{{ $t('exportView.exportPdfJpeg') }}</button>
    </div>

    <article class="resume-sheet" :aria-label="$t('exportView.documentLabel', { name: profileIdentity.fullName })">
      <header class="resume-header">
        <div class="resume-identity">
          <img
            class="resume-photo"
            :src="profilePhoto"
            :alt="$t('exportView.photoAlt', { name: profileIdentity.fullName })"
            loading="eager"
            decoding="async"
          >
          <div>
            <h1 class="resume-name">{{ profileIdentity.fullName }}</h1>
            <p class="resume-role">{{ $t('exportView.role') }}</p>
          </div>
        </div>
        <ul class="resume-links" :aria-label="$t('exportView.contactLinks')">
          <li v-for="link in exportContactLinks" :key="`${link.label}-${link.url}`">
            <a
              :href="link.url"
              :target="isExternalUrl(link.url) ? '_blank' : undefined"
              :rel="isExternalUrl(link.url) ? 'noopener noreferrer' : undefined"
            >
              {{ link.display }}
            </a>
          </li>
        </ul>
      </header>

      <section class="resume-section">
        <p class="resume-text">
          <template v-for="(segment, index) in exportProfileDescriptionSegments" :key="`${segment.type}-${index}`">
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
      </section>

      <section class="resume-section">
        <h2>{{ $t('experience.title') }}</h2>
        <article v-for="item in experiences" :key="item.id" class="experience-item">
          <div class="experience-heading">
            <h3>{{ item.content[currentLocale].role }}</h3>
            <p class="experience-period">{{ item.content[currentLocale].period }}</p>
          </div>
          <ul
            v-if="item.content[currentLocale].technologies?.length"
            class="experience-tags"
            :aria-label="$t('experience.technologiesLabel')"
          >
            <li
              v-for="technology in item.content[currentLocale].technologies"
              :key="`${item.id}-${technology}`"
              class="experience-tag"
            >
              {{ technology }}
            </li>
          </ul>
          <p class="experience-company">{{ item.content[currentLocale].company }}<span v-if="item.content[currentLocale].location" class="experience-location"> · {{ item.content[currentLocale].location }}</span></p>

          <template v-if="item.content[currentLocale].sections && item.content[currentLocale].sections!.length > 1">
            <p v-if="item.content[currentLocale].description" class="resume-text">{{ item.content[currentLocale].description }}</p>
            <div class="experience-sections">
              <div
                v-for="(section, index) in item.content[currentLocale].sections"
                :key="index"
                class="experience-section"
              >
                <div class="experience-section-head">
                  <h4 class="experience-section-title">{{ section.title }}</h4>
                  <ul
                    v-if="section.technologies?.length"
                    class="experience-tags experience-tags-inline"
                    :aria-label="$t('experience.technologiesLabel')"
                  >
                    <li
                      v-for="technology in section.technologies"
                      :key="`${item.id}-${index}-${technology}`"
                      class="experience-tag"
                    >
                      {{ technology }}
                    </li>
                  </ul>
                </div>
                <p class="resume-text">{{ section.description }}</p>
              </div>
            </div>
          </template>
          <p v-else class="resume-text">{{ item.content[currentLocale].description ?? item.content[currentLocale].sections?.[0]?.description }}</p>
        </article>
      </section>

      <section class="resume-section">
        <h2>{{ $t('profile.skillsTitle') }}</h2>
        <div class="skills-grid">
          <article v-for="category in exportSkills" :key="category.id" class="skill-category">
            <h3>{{ category.content[currentLocale].title }}</h3>
            <ul>
              <li v-for="item in category.content[currentLocale].items" :key="item.text">{{ item.text }}</li>
            </ul>
          </article>
        </div>
      </section>

      <p v-if="profileIdentity.portfolioUrl" class="export-attribution">
        <i18n-t keypath="exportView.attribution" tag="span">
          <template #link>
            <a
              :href="profileIdentity.portfolioUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ profileIdentity.portfolioUrl }}
            </a>
          </template>
        </i18n-t>
      </p>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useExperiencesData } from '../../content/data/experiences'
import { useSkillsData } from '../../content/data/skills'
import {
  getProfileContent,
  getProfileContactLinks,
  getProfileIdentity,
  getProfilePhoto,
  parseRichTextSegments,
} from '../../content/data/profile'
import { getSupportedLocale } from '../../content/locale'

const LANGUAGE_STORAGE_KEY = 'language'

const { locale, t } = useI18n()
const isPrintPreview = ref(false)
const { experiences } = useExperiencesData()
const { skills } = useSkillsData()
const profileIdentity = getProfileIdentity()
const profilePhoto = getProfilePhoto()

const currentLocale = computed(() => getSupportedLocale(locale.value))
const exportContactLinks = computed(() => getProfileContactLinks(currentLocale.value, { exportOnly: true }))
const exportSkills = computed(() => (
  skills.value
    .map((category) => ({
      ...category,
      content: {
        en: {
          ...category.content.en,
          items: category.content.en.items.filter((item) => !item.isJoke),
        },
        fr: {
          ...category.content.fr,
          items: category.content.fr.items.filter((item) => !item.isJoke),
        },
      },
    }))
    .filter((category) => (
      category.content.en.items.length > 0 || category.content.fr.items.length > 0
    ))
))
const exportProfileDescription = computed(() => getProfileContent(currentLocale.value).exportDescription)
  const exportProfileDescriptionSegments = computed(() => parseRichTextSegments(exportProfileDescription.value))

const languageSwitchLabel = computed(() => (locale.value === 'fr' ? 'EN' : 'FR'))
const languageSwitchTitle = computed(() => (
  locale.value === 'fr' ? t('exportView.switchToEnglish') : t('exportView.switchToFrench')
))
const printPreviewLabel = computed(() => (
  isPrintPreview.value ? t('exportView.previewOff') : t('exportView.previewOn')
))
const printPreviewTitle = computed(() => (
  isPrintPreview.value ? t('exportView.previewOffHint') : t('exportView.previewOnHint')
))

const toggleLanguage = () => {
  const nextLanguage = locale.value === 'fr' ? 'en' : 'fr'
  locale.value = nextLanguage
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
}

const togglePrintPreview = () => {
  isPrintPreview.value = !isPrintPreview.value
}

const printExport = () => {
  window.print()
}

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url)
</script>

<style scoped src="./Export.css"></style>
