import { useCallback, useEffect, useRef, useState } from "react";
import VoiceOrb from "./components/VoiceOrb.jsx";
import "./components/VoiceOrb.css";
import TranscriptFeed from "./components/TranscriptFeed.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import Suggestions from "./components/Suggestions.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import LanguageSelect from "./components/LanguageSelect.jsx";
import { useVoice } from "./useVoice.js";
import { api } from "./api.js";
import "./App.css";

export default function App() {
  const [lang, setLang] = useState("en-US");
  const { supported, listening, transcript, interim, error: voiceError, start, stop } = useVoice(lang);

  const [list, setList] = useState([]);
  const [entries, setEntries] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(null);
  const [banner, setBanner] = useState(null);
  const [commandPending, setCommandPending] = useState(false);
  const processedRef = useRef("");

  const refreshSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const { suggestions } = await api.getSuggestions();
      setSuggestions(suggestions);
    } catch {
      // Non-critical panel; fail quietly.
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getList().then((r) => setList(r.list)).catch(() => {});
    refreshSuggestions();
  }, [refreshSuggestions]);

  const logEntry = (heard, status, message) => {
    setEntries((prev) => [{ id: Date.now(), heard, status, message }, ...prev].slice(0, 6));
  };

  const runCommand = useCallback(
    async (text) => {
      setCommandPending(true);
      try {
        const res = await api.sendCommand(text);
        const { parsed } = res;

        if (parsed.intent === "add") {
          setList(res.list);
          logEntry(text, "ok", `Added ${parsed.quantity} × ${parsed.item}`);
          refreshSuggestions();
        } else if (parsed.intent === "remove") {
          setList(res.list);
          logEntry(text, "ok", `Removed ${parsed.item}`);
          refreshSuggestions();
        } else if (parsed.intent === "search") {
          setSearchResults(res.results);
          setSearchQuery(parsed.item || text);
          logEntry(text, "ok", `Found ${res.results.length} result(s)`);
        }
      } catch (e) {
        logEntry(text, "error", e.message || "Something went wrong");
      } finally {
        setCommandPending(false);
      }
    },
    [refreshSuggestions]
  );

  useEffect(() => {
    if (transcript && transcript !== processedRef.current) {
      processedRef.current = transcript;
      runCommand(transcript);
    }
  }, [transcript, runCommand]);

  useEffect(() => {
    if (voiceError) setBanner(voiceError);
  }, [voiceError]);

  const handleToggle = async (item) => {
    setList((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)));
    try {
      await api.toggleChecked(item.id, !item.checked);
    } catch {
      /* optimistic UI already applied */
    }
  };

  const handleRemove = async (item) => {
    setList((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await api.removeItem(item.name);
      refreshSuggestions();
    } catch {
      /* ignore */
    }
  };

  const handleQuantity = async (item, qty) => {
    if (qty < 1) return handleRemove(item);
    setList((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i)));
    try {
      await api.setQuantity(item.id, qty);
    } catch {
      /* ignore */
    }
  };

  const handleAddFromSuggestion = (name) => runCommand(`add ${name}`);

  return (
    <div className="app">
      <div className="app__glow" aria-hidden />

      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" />
          <span className="brand__name">Echo</span>
        </div>
        <LanguageSelect value={lang} onChange={setLang} />
      </header>

      <main className="hero">
        <p className="hero__eyebrow">Voice command shopping assistant</p>
        <h1 className="hero__title">
          Say it. <span className="hero__title--accent">It's on the list.</span>
        </h1>

        <VoiceOrb listening={listening} disabled={!supported} onClick={listening ? stop : start} />
        <p className="hero__hint">
          {commandPending
            ? "Processing…"
            : supported
            ? listening
              ? "Listening — try “add two apples”"
              : "Tap the orb and speak"
            : "Voice input isn't supported in this browser"}
        </p>

        {banner && (
          <div className="banner" role="alert">
            {banner}
            <button onClick={() => setBanner(null)} aria-label="Dismiss">×</button>
          </div>
        )}

        <TranscriptFeed interim={listening ? interim : ""} entries={entries} />
      </main>

      <section className="panels">
        <div className="panel panel--list">
          <h2 className="panel__title">Your list</h2>
          <ShoppingList
            items={list}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onQuantityChange={handleQuantity}
          />
        </div>

        <div className="panel">
          <h2 className="panel__title">Suggestions</h2>
          <Suggestions suggestions={suggestions} onAdd={handleAddFromSuggestion} loading={suggestionsLoading} />
        </div>

        <div className="panel">
          <h2 className="panel__title">Search</h2>
          <SearchPanel results={searchResults} query={searchQuery} onAdd={handleAddFromSuggestion} />
        </div>
      </section>

      <footer className="app__footer">Built for the Voice Command Shopping Assistant assessment.</footer>
    </div>
  );
}
