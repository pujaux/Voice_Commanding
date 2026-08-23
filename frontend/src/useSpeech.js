import { useCallback, useRef } from "react";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export function useSpeech(lang) {
  const enabledRef = useRef(true);

  const speak = useCallback(
    (text) => {
      if (!synth || !enabledRef.current || !text) return;
      synth.cancel(); // don't stack up utterances if commands come quickly
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.02;
      utterance.pitch = 1;

      const voices = synth.getVoices();
      const match = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang?.startsWith(lang.split("-")[0]));
      if (match) utterance.voice = match;

      synth.speak(utterance);
    },
    [lang]
  );

  const setEnabled = useCallback((value) => {
    enabledRef.current = value;
    if (!value) synth?.cancel();
  }, []);

  return { speak, setEnabled, supported: !!synth };
}
