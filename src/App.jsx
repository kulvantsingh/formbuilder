import React, { useState, useEffect } from "react";
import FormRenderer from "./FormRenderer";
import SubmissionsDashboard from "./SubmissionsDashboard";
import MasterSubmissionsTable from "./MasterSubmissionsTable";

function App() {
  const [viewMode, setViewMode] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("http://10.208.22.169:8086/forms");
      const data = await response.json();
      console.log(data)
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]); // auto-select first
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <svg className="sidebar-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <h2>Form Builder Pro</h2>
        </div>
        <div className="sidebar-content">
          <p className="sidebar-subtitle">YOUR TEMPLATES</p>
          {loading ? (
            <div className="sidebar-loading">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="sidebar-empty">No templates found in database.</div>
          ) : (
            <ul className="template-list">
              {templates.map(tpl => (
                <li
                  key={tpl.id}
                  className={`template-item ${selectedTemplate?.id === tpl.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  <span className="template-name">{tpl.name || tpl.formId || `Template ${tpl.id}`}</span>
                  <span className="template-id">ID: {tpl.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="sidebar-subtitle">MODES</p>
          <ul className="template-list">
            <li className={`template-item ${viewMode === 'templates' ? 'active' : ''}`} onClick={() => setViewMode('templates')}>
              <span className="template-name">✨ Form Builder</span>
            </li>
            <li className={`template-item ${viewMode === 'submissions' ? 'active' : ''}`} onClick={() => setViewMode('submissions')}>
              <span className="template-name">📥 Inbox Dashboard</span>
            </li>
            <li className={`template-item ${viewMode === 'master_table' ? 'active' : ''}`} onClick={() => setViewMode('master_table')}>
              <span className="template-name">📊 Master Data Table</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        {viewMode === "submissions" ? (
          <SubmissionsDashboard />
        ) : viewMode === "master_table" ? (
          <MasterSubmissionsTable />
        ) : selectedTemplate ? (
          <FormRenderer key={selectedTemplate.id} schema={selectedTemplate} />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No Form Selected</h3>
            <p>Select a template from the sidebar to start building.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;