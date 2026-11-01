const parseCsvRow = (line) => {
    const cells = [];
    let value = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
        else if (char === '"') quoted = !quoted;
        else if (char === ',' && !quoted) { cells.push(value.trim()); value = ''; }
        else value += char;
    }
    cells.push(value.trim());
    return cells;
};

export const parseStudentCsv = (text) => {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) throw new Error('CSV needs a header row and at least one student.');
    const headers = parseCsvRow(lines[0]).map((header) => header.toLowerCase().replace(/[\s_-]/g, ''));
    const required = ['email', 'rollno', 'branch', 'batch'];
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}.`);
    const column = Object.fromEntries(required.map((header) => [header, headers.indexOf(header)]));
    return lines.slice(1).map((line, index) => {
        const cells = parseCsvRow(line);
        return {
            email: cells[column.email] || '',
            rollNo: cells[column.rollno] || '',
            branch: cells[column.branch] || '',
            batch: cells[column.batch] || '',
            rowNumber: index + 2,
        };
    });
};
