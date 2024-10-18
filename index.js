document.getElementById('aggregateResultsButton').addEventListener('click', async () => {
  const SEPARATOR = '//';

  const files = Array.from(document.getElementById('fileInput').files);
  
  if (files.length === 0) {
    alert('Please upload at least one CSV file.');
    return;
  }

  // Map entries are ordered by insertion order
  const aggregatedResults = new Map();

  for (const file of files) {
    const text = await file.text();

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        results.data.forEach(row => {
          const contest = row['Contest'];
          const selection = row['Selection'];
          const votes = parseInt(row['Total Votes'], 10);

          const key = [contest, selection].join(SEPARATOR);
          aggregatedResults.set(key, {
            ...aggregatedResults.get(key),
            [file.name]: votes,
            totalVotes: (aggregatedResults.get(key)?.totalVotes ?? 0) + votes
          });
        });
      },
    });
  }

  const aggregatedResultsCsv = [];
  const headers = [
    'Contest',
    'Selection',
    ...files.map(file => file.name.replace('.csv', '')),
    'Total Votes',
  ];
  aggregatedResultsCsv.push(headers);
  for (const [key, results] of aggregatedResults.entries()) {
    const [contest, selection] = key.split(SEPARATOR);
    aggregatedResultsCsv.push([
      contest,
      selection,
      ...files.map(file => results[file.name] ?? ''),
      results.totalVotes,
    ]);
  }

  // Auto-download the aggregated results CSV
  const blob = new Blob([Papa.unparse(aggregatedResultsCsv)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aggregated-results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
