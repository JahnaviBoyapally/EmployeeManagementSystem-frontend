
import { useCallback, useEffect, useState } from "react";
import Auth from "./Auth";
import api from "./api";
import "./App.css";
import Dashboard from "./Dashboard";
import Reports from "./Reports";

const emptyForm = {
  name: "",
  email: "",
  salary: "",
  departmentId: "",
};

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [activeSection, setActiveSection] = useState("dashboard");

  const navigateTo = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [direction, setDirection] = useState("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [employeePage, setEmployeePage] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    first: true,
    last: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDepartments = useCallback(async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error(
        "Failed to load departments:",
        error.response?.data ?? error.message
      );
      setErrorMessage("Could not load departments.");
    }
  }, []);

  const loadEmployeePage = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/employees/search", {
        params: {
          keyword: searchKeyword.trim() || undefined,
          departmentId: departmentFilter
            ? Number(departmentFilter)
            : undefined,
          page,
          size: pageSize,
          sortBy,
          direction,
        },
      });

      setEmployeePage(response.data);
      setEmployees(response.data.content);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error.response?.data ?? error.message
      );

      setErrorMessage(
        error.response?.data?.error ??
          "Could not load employees. Check your connection and login."
      );
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, departmentFilter, page, pageSize, sortBy, direction]);

  useEffect(() => {
    if (loggedIn) {
      loadDepartments();
    }
  }, [loggedIn, loadDepartments]);

  useEffect(() => {
    if (loggedIn) {
      loadEmployeePage();
    }
  }, [loggedIn, loadEmployeePage]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const requestBody = {
      name: form.name.trim(),
      email: form.email.trim(),
      salary: Number(form.salary),
      departmentId: Number(form.departmentId),
    };

    if (
      !requestBody.name ||
      !requestBody.email ||
      !form.salary ||
      !form.departmentId ||
      !Number.isFinite(requestBody.salary) ||
      requestBody.salary < 0
    ) {
      setErrorMessage("Enter a name, email, valid salary, and department.");
      return;
    }

    try {
      if (editingId !== null) {
        await api.put(`/employees/${editingId}`, requestBody);
        alert("Employee updated successfully.");
      } else {
        await api.post("/employees", requestBody);
        alert("Employee added successfully.");
      }

      resetForm();
      await loadEmployeePage();
      await loadDepartments();
    } catch (error) {
      const message =
        error.response?.data?.error ??
        "Failed to save employee. Check the backend and try again.";
      setErrorMessage(message);
    }
  };

  const editEmployee = (employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name ?? "",
      email: employee.email ?? "",
      salary: String(employee.salary ?? ""),
      departmentId: employee.department?.id ? String(employee.department.id) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEmployee = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      alert("Employee deleted successfully.");

      if (employeePage.content.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await loadEmployeePage();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ?? "Failed to delete employee."
      );
    }
  };

  const addDepartment = async (event) => {
    event.preventDefault();

    const name = newDepartment.trim();
    if (!name) {
      alert("Enter a department name.");
      return;
    }

    try {
      await api.post("/departments", { name });
      setNewDepartment("");
      await loadDepartments();
      alert("Department added successfully.");
    } catch (error) {
      console.error("Add department error:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          `Failed to add department (${error.response?.status || "network error"}).`
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setLoggedIn(false);
    setEmployees([]);
    setDepartments([]);
    resetForm();
  };

  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <h2>PeopleFlow</h2>
            <span>HR MANAGEMENT</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <button
            className={activeSection === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => navigateTo("dashboard")}
          >
            <span className="nav-icon">▦</span>
            Dashboard
          </button>

          <button
            className={activeSection === "employees" ? "nav-item active" : "nav-item"}
            onClick={() => navigateTo("employees")}
          >
            <span className="nav-icon">♙</span>
            Employees
          </button>

          <button
            className={activeSection === "departments" ? "nav-item active" : "nav-item"}
            onClick={() => navigateTo("departments")}
          >
            <span className="nav-icon">▤</span>
            Departments
          </button>

          <button
            className={activeSection === "reports" ? "nav-item active" : "nav-item"}
            onClick={() => navigateTo("reports")}
          >
            <span className="nav-icon">▥</span>
            Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {(localStorage.getItem("userName") || "A").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{localStorage.getItem("userName") || "Administrator"}</strong>
              <span>Workspace Admin</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={logout}>
            ↪ &nbsp; Sign out
          </button>
        </div>
      </aside>

      <main className="app-container workspace">
        <header className="page-header">
          <div>
            <span className="eyebrow">YOUR PEOPLE. YOUR WORKSPACE.</span>
            <h1>Welcome back, {localStorage.getItem("userName") || "Admin"} 👋</h1>
            <p>Manage your people, teams, and workplace in one place.</p>
          </div>

          <button className="secondary-button" onClick={logout}>
            Logout ↗
          </button>
        </header>

        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
            <button
              type="button"
              className="close-error"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div id="dashboard" className="content-section">
          <Dashboard />
        </div>

        <section id="employees" className="content-section panel">
          <h2>{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>

          <form onSubmit={handleSubmit} className="employee-form">
            <label>
              Employee name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Enter employee name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </label>

            <label>
              Salary
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="Enter salary"
              />
            </label>

            <label>
              Department
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId !== null ? "Update Employee" : "Add Employee"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section id="departments" className="content-section panel">
          <h2>Department Management</h2>

          <form onSubmit={addDepartment} className="department-form">
            <input
              value={newDepartment}
              onChange={(event) => setNewDepartment(event.target.value)}
              placeholder="Enter new department name"
              aria-label="New department name"
              required
            />

            <button type="submit" className="primary-button">
              Add Department
            </button>
          </form>

          <div className="department-list">
            {departments.length === 0 ? (
              <p>No departments found.</p>
            ) : (
              departments.map((department) => (
                <span className="department-chip" key={department.id}>
                  {department.name}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="content-section panel">
          <h2>Employee List</h2>

          <div className="employee-tools">
            <input
              type="search"
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(0);
              }}
              placeholder="Search name or email"
              aria-label="Search employees"
            />

            <select
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value);
                setPage(0);
              }}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(0);
              }}
              aria-label="Sort field"
            >
              <option value="name">Sort by name</option>
              <option value="email">Sort by email</option>
              <option value="salary">Sort by salary</option>
            </select>

            <select
              value={direction}
              onChange={(event) => {
                setDirection(event.target.value);
                setPage(0);
              }}
              aria-label="Sort direction"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
              aria-label="Employees per page"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>

          {loading ? (
            <p className="status-message">Loading employees...</p>
          ) : (
            <div className="table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department?.name ?? "Not assigned"}</td>
                        <td>{employee.salary}</td>
                        <td className="action-buttons">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => editEmployee(employee)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => current - 1)}
              disabled={employeePage.first || loading}
            >
              Previous
            </button>

            <span>
              Page {employeePage.totalPages === 0 ? 0 : page + 1} of {employeePage.totalPages} · {employeePage.totalElements} employees
            </span>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => current + 1)}
              disabled={employeePage.last || loading}
            >
              Next
            </button>
          </div>
        </section>

        <div id="reports" className="content-section">
          <Reports />
        </div>
      </main>
    </div>
  );
}

export default App;
