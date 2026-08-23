export default function TranscriptFeed({ interim, entries }) {
  return (
    <div className="transcript">
      <div className="transcript__live" aria-live="polite">
        {interim ? <span className="transcript__interim">{interim}</span> : <span className="transcript__placeholder">Listening…</span>}
      </div>
      <ul className="transcript__log">
        {entries.map((entry) => (
          <li key={entry.id} className={`transcript__entry transcript__entry--${entry.status}`}>
            <span className="transcript__heard">“{entry.heard}”</span>
            <span className="transcript__result">{entry.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
