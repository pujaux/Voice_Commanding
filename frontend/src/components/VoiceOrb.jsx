export default function VoiceOrb({ listening, onClick, disabled }) {
  return (
    <button
      className={`voice-orb ${listening ? "voice-orb--listening" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start voice command"}
    >
      <span className="voice-orb__ring" />
      <span className="voice-orb__ring voice-orb__ring--delay" />
      <span className="voice-orb__core">
        <MicIcon />
      </span>
    </button>
  );
}

function MicIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18.5V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
