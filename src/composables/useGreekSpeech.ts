import { onBeforeUnmount, shallowRef } from 'vue'

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function useGreekSpeech() {
  const speechMessage = shallowRef('')
  let availableVoices: SpeechSynthesisVoice[] = []

  function refreshVoices() {
    if (isSupported) availableVoices = window.speechSynthesis.getVoices()
  }

  if (isSupported) {
    refreshVoices()
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
  }

  function speakGreek(text: string) {
    if (!isSupported || !text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'el-GR'
    utterance.rate = 0.85
    utterance.volume = 1

    refreshVoices()
    const voices = availableVoices
    const greekVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('el'))
    if (!greekVoice && voices.length) {
      speechMessage.value = 'Греческий голос не установлен. Добавьте греческий голос в настройках устройства.'
      window.speechSynthesis.cancel()
      return
    }

    if (greekVoice) utterance.voice = greekVoice
    speechMessage.value = greekVoice ? '' : 'Список голосов ещё загружается; пробую системный греческий голос…'
    utterance.onstart = () => {
      speechMessage.value = ''
    }
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') return
      if (event.error === 'language-unavailable' || event.error === 'voice-unavailable') {
        speechMessage.value = 'На устройстве нет доступного греческого голоса. Скачайте греческий голос в настройках озвучивания.'
      } else if (event.error === 'not-allowed') {
        speechMessage.value = 'Браузер заблокировал озвучивание. Нажмите на динамик ещё раз.'
      } else {
        speechMessage.value = `Не удалось воспроизвести звук (${event.error}). Проверьте настройки озвучивания устройства.`
      }
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  onBeforeUnmount(() => {
    if (isSupported) {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices)
      window.speechSynthesis.cancel()
    }
  })

  return { isSpeechSupported: isSupported, speechMessage, speakGreek }
}
