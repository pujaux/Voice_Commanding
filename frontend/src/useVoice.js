import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognition =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useVoice(lang) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
      setInterim("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk;
        else interimText += chunk;
      }
      if (interimText) setInterim(interimText);
      if (finalText) setTranscript(finalText.trim());
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone access was denied. Enable it in your browser settings.",
        "no-speech": "No speech detected — try again.",
        "network": "Network error while recognizing speech.",
      };
      setError(messages[event.error] || `Voice recognition error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Voice recognition isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    setTranscript("");
    try {
      recognitionRef.current.start();
    } catch {
      // start() throws if already started; ignore.
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  return {
    supported: !!SpeechRecognition,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    clearTranscript,
  };
}
