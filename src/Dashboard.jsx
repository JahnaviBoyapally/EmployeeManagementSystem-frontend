
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import api from "./api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await api.get("/dashboard/summary");

        if (active) {
          setSummary(response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          const status = err.response?.status;

          if (status === 401 || status === 403) {
            setError(
              "Your session may have expired. Please log in again."
            );
          } else {
            setError(
              err.response?.data?.message ||
              "Unable to load dashboard statistics."
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return <p>No dashboard data available.</p>;
  }

  const cards = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
    },
    {
      title: "Total Departments",
      value: summary.totalDepartments,
    },
    {
      title: "Total Salary",
      value: currency.format(summary.totalSalary),
    },
    {
      title: "Average Salary",
      value: currency.format(summary.averageSalary),
    },
  ];

  return (
    <section style={{ padding: "20px" }}>
      <h2>Employee Management Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            <p>{card.title}</p>
            <h3>{card.value}</h3>
          </div>
        ))}
      </div>

      <h3>Employees by Department</h3>

      {summary.employeesByDepartment.length === 0 ? (
        <p>No employees have been added yet.</p>
      ) : (
        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.employeesByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="departmentName"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={70}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar dataKey="employeeCount" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
