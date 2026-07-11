function LoadingSpinner() {
  return (
    <div className="plotter">
      <div className="plotter-track">
        <div className="plotter-beam" />
      </div>
      <h2>Plotting CRM records…</h2>
      <p>Gemini is mapping your columns in batches. This can take a moment for larger files.</p>
    </div>
  );
}

export default LoadingSpinner;
