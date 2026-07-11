function PreviewTable({ data }) {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <>
      <div className="section-heading">
        <span>Raw CSV preview</span>
        <span className="count">{data.length} rows</span>
      </div>

      <div className="table-wrap">
        <table className="manifest">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PreviewTable;
