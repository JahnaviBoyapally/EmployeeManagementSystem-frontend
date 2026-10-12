
import { useEffect, useState } from "react";
import api from "./api";

function Reports() {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get("/departments")
      .then((response) => {
        if (active) {
          setDepartments(response.data);
        }
      })
      .catch((err) => {
        console.error(
          "Failed to load departments:",
          err.response?.data ?? err.message
        );

        if (active) {
          setError("Could not load departments.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/reports/employees", {
          params: departmentId
            ? { departmentId: Number(departmentId) }
            : {},
        });

        if (active) {
          setReport(response.data);
        }
      } catch (err) {
        console.error(
          "Failed to load report:",
          err.response?.data ?? err.message
        );

        if (active) {
          setError(
            err.response?.status === 401 ||
            err.response?.status === 403
              ? "Your session may have expired. Please log in again."
              : "Could not load the employee report."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      active = false;
    };
  }, [departmentId]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value ?? 0);

  const exportCSV = () => {
    if (!report || report.employees.length === 0) {
      alert("There are no employee records to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Department",
      "Salary",
    ];

    const escapeCSV = (value) => {
      let text = String(value ?? "");

      // Reduce the risk of spreadsheet formula injection.
      if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = report.employees.map((employee) => [
      employee.id,
      employee.name,
      employee.email,
      employee.departmentName,
      employee.salary ?? "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "employee-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="reports-page">
      <div className="reports-heading">
        <div>
          <h2>Employee Reports</h2>
          <p>View and export employee information.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={exportCSV}
          disabled={
            loading ||
            !report ||
            report.employees.length === 0
          }
        >
          Export CSV
        </button>
      </div>

      <section className="panel">
        <label htmlFor="report-department">
          Filter by department
        </label>

        <select
          id="report-department"
          value={departmentId}
          onChange={(event) =>
            setDepartmentId(event.target.value)
          }
        >
          <option value="">All departments</option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="status-message">Loading report...</p>
      ) : report ? (
        <>
          <div className="report-summary">
            <article className="report-card">
              <h3>Total Employees</h3>
              <p>{report.totalEmployees}</p>
            </article>

            <article className="report-card">
              <h3>Total Salary</h3>
              <p>{formatMoney(report.totalSalary)}</p>
            </article>

            <article className="report-card">
              <h3>Average Salary</h3>
              <p>{formatMoney(report.averageSalary)}</p>
            </article>
          </div>

          <section className="panel">
            <h3>Employee Report Details</h3>

            <div className="table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                  </tr>
                </thead>

                <tbody>
                  {report.employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No employees found for this selection.
                      </td>
                    </tr>
                  ) : (
                    report.employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.departmentName}</td>
                        <td>{formatMoney(employee.salary)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

export default Reports;
