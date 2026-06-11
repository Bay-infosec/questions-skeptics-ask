export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand__mark">Q</span>
      <span>
        <strong>Questions Skeptics Ask</strong>
        <small>About Christianity</small>
      </span>
    </div>
  );
}
