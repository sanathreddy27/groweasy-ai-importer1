function SummaryCards({ imported, skipped, total }) {
  return (
    <div className="summary-strip">
      <div className="summary-cell imported">
        <p className="value">{imported}</p>
        <p className="label">Imported</p>
      </div>
      <div className="summary-cell skipped">
        <p className="value">{skipped}</p>
        <p className="label">Skipped</p>
      </div>
      <div className="summary-cell total">
        <p className="value">{total}</p>
        <p className="label">Total rows</p>
      </div>
    </div>
  );
}

export default SummaryCards;
