import React, { useState, useEffect } from "react";
import FormRenderer from "./FormRenderer";
import SubmissionsDashboard from "./SubmissionsDashboard";
import MasterSubmissionsTable from "./MasterSubmissionsTable";

const NAV_ITEMS = [
  { id: "templates", icon: "✦", label: "Form Builder" },
  { id: "submissions", icon: "⊟", label: "Inbox" },
  { id: "master_table", icon: "⊞", label: "Master Table" },
];

function App() {
  const [viewMode, setViewMode] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("appTheme") || "dark"
  );
  const [sidebarSearch, setSidebarSearch] = useState("");

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("appTheme", next);
      return next;
    });
  };

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("http://10.208.22.169:8086/forms");
      const data = await response.json();
      setTemplates(data);
      const lastId = localStorage.getItem("lastSelectedFormId");
      const lastTemplate = lastId ? data.find(t => String(t.id) === lastId) : null;
      if (lastTemplate) {
        setSelectedTemplate(lastTemplate);
      } else if (data.length > 0) {
        setSelectedTemplate(data[0]);
        localStorage.setItem("lastSelectedFormId", String(data[0].id));
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(tpl =>
    (tpl.name || `Template ${tpl.id}`).toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className="layout-container" data-theme={theme}>
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <div className="brand-name">FormBuilder</div>
              <div className="brand-sub">Pro Studio</div>
            </div>
          </div>
          <button className="theme-toggle-btn icon-only" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-btn${viewMode === item.id ? " nav-btn-active" : ""}`}
              onClick={() => setViewMode(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        {/* Templates */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-subtitle">TEMPLATES</span>
            <span className="template-count">{templates.length}</span>
          </div>

          {/* Search */}
          <div className="sidebar-search-wrap">
            <span className="sidebar-search-icon">⌕</span>
            <input
              className="sidebar-search"
              placeholder="Search forms…"
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
            />
          </div>

          <ul className="template-list">
            {loading ? (
              <li className="sidebar-loading">
                <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
              </li>
            ) : filteredTemplates.length === 0 ? (
              <li className="sidebar-empty">No forms found.</li>
            ) : filteredTemplates.map(tpl => (
              <li
                key={tpl.id}
                className={`template-item${selectedTemplate?.id === tpl.id ? " active" : ""}`}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  localStorage.setItem("lastSelectedFormId", String(tpl.id));
                  setViewMode("templates");
                }}
              >
                <div className="template-item-icon">{(tpl.name || "F")[0].toUpperCase()}</div>
                <div className="template-item-body">
                  <span className="template-name">{tpl.name || `Template ${tpl.id}`}</span>
                  <span className="template-id">ID · {tpl.id}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>


      </aside>

      <main className="main-content">
        {viewMode === "submissions" ? (
          <SubmissionsDashboard />
        ) : viewMode === "master_table" ? (
          <MasterSubmissionsTable />
        ) : selectedTemplate ? (
          <FormRenderer key={selectedTemplate.id} schema={selectedTemplate} theme={theme} />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No Form Selected</h3>
            <p>Choose a template from the sidebar to preview it here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;