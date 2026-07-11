function CRMTable({ records }) {
  if (!records || records.length === 0) return null;

  const stampClass = (status) => {
    switch (status) {
      case "GOOD_LEAD_FOLLOW_UP":
        return "stamp stamp-good";
      case "SALE_DONE":
        return "stamp stamp-sale";
      case "DID_NOT_CONNECT":
        return "stamp stamp-pending";
      case "BAD_LEAD":
        return "stamp stamp-bad";
      default:
        return "stamp";
    }
  };

  return (
    <>
      <div className="section-heading">
        <span>AI-extracted CRM records</span>
        <span className="count">{records.length} rows</span>
      </div>

      <div className="table-wrap">
        <table className="manifest">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Company</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td>{record.name}</td>
                <td>{record.email}</td>
                <td>{record.mobile_without_country_code}</td>
                <td>{record.company}</td>
                <td>
                  <span className={stampClass(record.crm_status)}>
                    {record.crm_status}
                  </span>
                </td>
                <td>{record.data_source || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CRMTable;
