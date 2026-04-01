import * as Tone from 'tone'

let sampler: Tone.Sampler | null = null
let initialized = false

export async function initSound(): Promise<void> {
  if (initialized) return
  await Tone.start()
  sampler = new Tone.Sampler({
    urls: {
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3',
    },
    release: 1,
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
  })
  sampler.volume.value = 6
  sampler.toDestination()
  await Tone.loaded()
  initialized = true
}

export function playNote(note: string, duration = '4n'): void {
  if (!sampler) return
  sampler.triggerAttackRelease(note, duration)
}
