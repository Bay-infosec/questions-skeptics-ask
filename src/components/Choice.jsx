export default function Choice({ checked, children, multiple = false, onChange }) {
  return (
    <button
      type="button"
      className={`choice ${checked ? "choice--checked" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span className={`choice__control ${multiple ? "choice__control--square" : ""}`}>
        {checked ? "✓" : ""}
      </span>
      <span>{children}</span>
    </button>
  );
}
