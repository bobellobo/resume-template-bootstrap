<template>
  <button
    v-if="repoUrl.trim().length > 0"
    type="button"
    :class="['template-notice-icon', { 'template-notice-icon-opened': !showNotificationDot }]"
    :aria-label="$t('templateNotice.iconAriaLabel')"
    :title="$t('templateNotice.iconTooltip')"
    @click="openDialog"
  >
    <svg class="template-notice-bell" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 8.25C18 4.8 15.31 2 12 2C8.69 2 6 4.8 6 8.25V11.23C6 12.17 5.66 13.07 5.05 13.74L3.85 15.06C3.25 15.72 3.72 16.8 4.61 16.8H19.39C20.28 16.8 20.75 15.72 20.15 15.06L18.95 13.74C18.34 13.07 18 12.17 18 11.23V8.25Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.3 19.2C9.79 20.29 10.84 21 12 21C13.16 21 14.21 20.29 14.7 19.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  </button>

  <Teleport to="body">
    <Transition name="template-dialog-pop">
      <div
        v-if="isDialogOpen"
        class="template-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="dialogTitleId"
        @click="closeDialog"
      >
        <div class="template-dialog-overlay"></div>
        <div class="template-dialog-content" @click.stop>
          <button
            type="button"
            class="template-dialog-close"
            :aria-label="$t('templateNotice.closeDialog')"
            @click="closeDialog"
          >
            ×
          </button>
          <h2 :id="dialogTitleId">{{ $t('templateNotice.dialogTitle') }}</h2>
          <p>{{ $t('templateNotice.dialogDescription') }}</p>
          <div class="template-dialog-actions">
            <a
              :href="repoUrl"
              class="template-dialog-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t('templateNotice.openRepository') }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  repoUrl: string
}>()

const NOTICE_DOT_DISMISSED_STORAGE_KEY = 'template-notice-dot-dismissed'

const isDialogOpen = ref(false)
const showNotificationDot = ref(false)
const dialogTitleId = 'template-dialog-title'

const openDialog = () => {
  isDialogOpen.value = true
  if (showNotificationDot.value) {
    showNotificationDot.value = false
    window.localStorage.setItem(NOTICE_DOT_DISMISSED_STORAGE_KEY, '1')
  }
}

const closeDialog = () => {
  isDialogOpen.value = false
}

onMounted(() => {
  if (!props.repoUrl.trim()) {
    showNotificationDot.value = false
    return
  }

  const isDotDismissed = window.localStorage.getItem(NOTICE_DOT_DISMISSED_STORAGE_KEY) === '1'
  showNotificationDot.value = !isDotDismissed
})
</script>

<style scoped src="./TemplateNotice.css"></style>
