import React, { useState, useEffect } from 'react';

const MasterSubmissionsTable = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterFormId, setFilterFormId] = useState('');
    const [globalSearch, setGlobalSearch] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchSubmissions('');
    }, []);

    const fetchSubmissions = async (formId) => {
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const highlightText = (text, search) => {
        if (!search || !text) return text;
        const str = String(text);
        const escaped = search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = str.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i} style={{ backgroundColor: '#FDE047', color: '#000', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> : part
        );
    };

    // Aggregate all unique keys to form the table columns
    const allKeysSet = new Set();
    const formattedData = submissions.map(sub => {
        const subData = sub.data || sub;
        const rawAnswers = subData.data || subData;
        Object.keys(rawAnswers).forEach(key => allKeysSet.add(key));
        return {
            ...sub,
            rawAnswers
        };
    });

    // Convert to Array and move standard fields to front if they exist
    const columns = Array.from(allKeysSet);

    // Apply Global Search
    const searchedData = formattedData.filter(row => {
        if (!globalSearch) return true;
        const searchLower = globalSearch.toLowerCase();
        if (String(row.id).toLowerCase().includes(searchLower)) return true;
        if (String(row.formId).toLowerCase().includes(searchLower)) return true;
        if (String(row.createdAt).includes(searchLower)) return true;
        for (const col of columns) {
            const val = row.rawAnswers[col];
            if (val !== undefined && val !== null && String(val).toLowerCase().includes(searchLower)) return true;
        }
        return false;
    });

    // Apply Sort
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return searchedData;
        return [...searchedData].sort((a, b) => {
            const isBase = ['id', 'formId', 'createdAt'].includes(sortConfig.key);
            const aVal = isBase ? a[sortConfig.key] : a.rawAnswers[sortConfig.key];
            const bVal = isBase ? b[sortConfig.key] : b.rawAnswers[sortConfig.key];

            if (aVal === bVal) return 0;
            const aStr = String(aVal || '');
            const bStr = String(bVal || '');
            if (sortConfig.direction === 'asc') return aStr.localeCompare(bStr, undefined, { numeric: true });
            return bStr.localeCompare(aStr, undefined, { numeric: true });
        });
    }, [searchedData, sortConfig]);

    // Apply Pagination
    const actualRowsPerPage = rowsPerPage === 'All' ? sortedData.length || 1 : rowsPerPage;
    const totalPages = Math.max(1, Math.ceil(sortedData.length / actualRowsPerPage));
    const paginatedData = sortedData.slice((currentPage - 1) * actualRowsPerPage, currentPage * actualRowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch, sortConfig]);

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header" style={{ alignItems: 'flex-start' }}>
                <h2>Master Data Table</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <form onSubmit={handleFilter} className="dashboard-filter">
                        <input
                            type="text"
                            placeholder="Fetch by Form ID"
                            value={filterFormId}
                            onChange={(e) => setFilterFormId(e.target.value)}
                            className="filter-input"
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Fetch</button>
                        {filterFormId && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setFilterFormId(''); fetchSubmissions(''); }} style={{ padding: '8px 16px' }}>Clear</button>
                        )}
                    </form>
                    <div className="dashboard-filter">
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="filter-input"
                            style={{ minWidth: '220px' }}
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-body">
                {loading ? (
                    <div className="dashboard-loading">Loading master table...</div>
                ) : submissions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No Data Found</h3>
                        <p>We couldn't find any data matching your criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto', background: 'rgba(30, 41, 59, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <table className="submissions-table" style={{ whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Submission ID {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => handleSort('formId')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Form ID {sortConfig?.key === 'formId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Timestamp {sortConfig?.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    {columns.map(col => (
                                        <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                            {col} {sortConfig?.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((row, idx) => (
                                    <tr key={row.id || idx}>
                                        <td style={{ opacity: 0.8 }}>{highlightText(row.id || `#${idx + 1}`, globalSearch)}</td>
                                        <td style={{ color: 'var(--primary)' }}>{highlightText(row.formId || "Unknown", globalSearch)}</td>
                                        <td>
                                            {highlightText(row.createdAt ? new Date(row.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            }) : 'Unknown', globalSearch)}
                                        </td>
                                        {columns.map(col => {
                                            const val = row.rawAnswers[col];
                                            return (
                                                <td key={col}>
                                                    {val !== undefined && val !== null ? (typeof val === 'object' ? highlightText(JSON.stringify(val), globalSearch) : highlightText(String(val), globalSearch)) : <span style={{ opacity: 0.3 }}>-</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {sortedData.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Rows per page:</span>
                            <select
                                className="filter-input"
                                style={{ padding: '6px 12px', width: 'auto' }}
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value="All">All</option>
                            </select>
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterSubmissionsTable;
