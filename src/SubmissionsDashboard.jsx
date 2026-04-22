import React, { useState, useEffect } from 'react';

const SubmissionsDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterFormId, setFilterFormId] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async (formId = '') => {
        setLoading(true);
        try {
            const url = formId
                ? `http://10.208.22.169:8086/submissions/form/${formId}`
                : 'http://10.208.22.169:8086/submissions';

            const res = await fetch(url);
            const data = await res.json();
            const sortedData = Array.isArray(data)
                ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                : [];
            setSubmissions(sortedData);
        } catch (err) {
            console.error("Failed to fetch submissions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchSubmissions(filterFormId);
    };

    const toggleExpand = (id) => {
        if (expandedId === id) setExpandedId(null);
        else setExpandedId(id);
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <h2>Submissions Inbox</h2>
                <form onSubmit={handleFilter} className="dashboard-filter">
                    <input
                        type="text"
                        placeholder="Filter by Form ID (e.g. 8)"
                        value={filterFormId}
                        onChange={(e) => setFilterFormId(e.target.value)}
                        className="filter-input"
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Filter</button>
                    {filterFormId && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setFilterFormId(''); fetchSubmissions(''); }} style={{ padding: '8px 16px' }}>Clear</button>
                    )}
                </form>
            </div>

            <div className="dashboard-body">
                {loading ? (
                    <div className="dashboard-loading">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No Submissions Found</h3>
                        <p>We couldn't find any data matching your criteria.</p>
                    </div>
                ) : (
                    <div className="submissions-grid">
                        {submissions.map((sub, idx) => {
                            // The API usually wraps submission body in a 'data' array/object or direct.
                            const subData = sub.data || sub;
                            // Extract the nested 'data' if it exists (created by our FormRenderer wrapping)
                            const rawAnswers = subData.data || subData;

                            return (
                                <div key={sub.id || idx} className={`submission-card ${expandedId === (sub.id || idx) ? 'expanded' : ''}`}>
                                    <div className="sub-card-header" onClick={() => toggleExpand(sub.id || idx)}>
                                        <div className="sub-card-title">
                                            <strong>Target Form: </strong> {sub.formId || "Unknown"}
                                        </div>
                                        <div className="sub-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <span className="sub-card-time" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                                                {sub.createdAt ? new Date(sub.createdAt).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                }) : 'Unknown Time'}
                                            </span>
                                            {subData.email || rawAnswers.email ? (
                                                <span className="sub-card-email" style={{ fontSize: '12px', opacity: 0.8 }}>{subData.email || rawAnswers.email}</span>
                                            ) : null}
                                        </div>
                                        <div className="sub-card-toggle">
                                            {expandedId === (sub.id || idx) ? '▲ Collapse Details' : '▼ View Payload'}
                                        </div>
                                    </div>

                                    {expandedId === (sub.id || idx) && (
                                        <div className="sub-card-content">
                                            <div className="table-responsive" style={{ padding: '32px', paddingBottom: '0', overflowX: 'auto' }}>
                                                <table className="submissions-table" style={{ whiteSpace: 'nowrap' }}>
                                                    <thead>
                                                        <tr>
                                                            {Object.keys(rawAnswers).map((key) => (
                                                                <th key={key}>{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {Object.values(rawAnswers).map((value, vIdx) => (
                                                                <td key={vIdx}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ padding: '0 32px', marginTop: '24px', fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>Raw JSON Payload:</div>
                                            <pre className="json-viewer" style={{ paddingTop: '16px' }}>
                                                {JSON.stringify(rawAnswers, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionsDashboard;
