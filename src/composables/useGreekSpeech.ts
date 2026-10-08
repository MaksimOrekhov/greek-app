import { onBeforeUnmount, shallowRef } from 'vue'

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function useGreekSpeech() {
  const speechMessage = shallowRef('')

  function speakGreek(text: string) {
    if (!isSupported || !text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'el-GR'
    utterance.rate = 0.85
    utterance.volume = 1

    const voices = window.speechSynthesis.getVoices()
    const greekVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('el'))
    if (!greekVoice) {
      speechMessage.value = voices.length
        ? 'Греческий голос не установлен. Добавьте греческий голос в настройках устройства.'
        : 'Chrome пока не загрузил список голосов. Обновите страницу и попробуйте снова.'
      window.speechSynthesis.cancel()
      return
    }

    utterance.voice = greekVoice
    speechMessage.value = ''
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
    if (isSupported) window.speechSynthesis.cancel()
  })

  return { isSpeechSupported: isSupported, speechMessage, speakGreek }
}
