export const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Español" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "fr-FR", label: "Français" },
];

export default function LanguageSelect({ value, onChange }) {
  return (
    <select
      className="language-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Voice recognition language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
