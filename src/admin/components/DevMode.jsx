import { useEffect, useState } from 'react';
import { fetchData } from '../../common/services/fetchData';
import { toastNotification } from '../../common/utils/toastNotification';

function DevMode() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [logs, setLogs] = useState([]);

  const loadLogs = () => {
    setLoading(true);
    fetchData('tsreview/devmode/get_logs', (response) => {
      setLoading(false);
      if (response?.success) {
        setEnabled(!!response.data.enabled);
        setLogs(Array.isArray(response.data.logs) ? response.data.logs : []);
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Could not load logs.');
      }
    });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const toggleMode = () => {
    fetchData('tsreview/devmode/toggle', (response) => {
      if (response?.success) {
        setEnabled(!!response.data.enabled);
        toastNotification('success', 'Dev Mode', response?.data?.message || 'Updated');
        loadLogs();
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Could not toggle dev mode.');
      }
    }, {
      enabled: enabled ? '0' : '1',
    });
  };

  const clearLogs = () => {
    fetchData('tsreview/devmode/clear_logs', (response) => {
      if (response?.success) {
        toastNotification('success', 'Logs Cleared', response?.data?.message || 'Cleared');
        loadLogs();
      } else {
        toastNotification('error', 'Failed', response?.data?.message || 'Could not clear logs.');
      }
    });
  };

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 gradient-mesh sm:p-8">
        <div className="min-w-0">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Hidden Route
          </span>
          <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Dev Mode</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Direct-access diagnostics for TS Customer Review. Route: <code>admin.php?page=ts-review-showcase&path=devmode</code>
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5">
        <section className="bento-card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Logger Control</h3>
              <p className="text-sm text-muted-foreground">Enable logging, refresh entries, and clear old logs.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleMode} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
                {enabled ? 'Disable Logging' : 'Enable Logging'}
              </button>
              <button type="button" onClick={loadLogs} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
                Refresh
              </button>
              <button type="button" onClick={clearLogs} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
                Clear Logs
              </button>
            </div>
          </div>

          <div className="text-sm">
            <span className={`inline-flex rounded-full px-3 py-1 font-semibold ${enabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {enabled ? 'Logging Enabled' : 'Logging Disabled'}
            </span>
          </div>
        </section>

        <section className="bento-card">
          <div className="mb-5 border-b border-border pb-5">
            <h3 className="text-lg font-bold text-foreground">Plugin Log</h3>
            <p className="text-sm text-muted-foreground">Email tests, reminder scheduling, reminder sends, review submissions, and provider failures appear here.</p>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading logs…</div>
          ) : logs.length ? (
            <div className="space-y-3">
              {logs.map((entry, index) => (
                <article key={`${entry.time}-${entry.event}-${index}`} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-1 font-semibold ${entry.level === 'error' ? 'bg-red-100 text-red-700' : entry.level === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>
                      {entry.level}
                    </span>
                    <span className="font-semibold text-foreground">{entry.event}</span>
                    <span className="text-muted-foreground">{entry.time}</span>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-xs text-foreground">{JSON.stringify(entry.context || {}, null, 2)}</pre>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No logs yet. Enable logging, then run test email, reminder, review submission, or reminder scheduling flows.</div>
          )}
        </section>
      </div>
    </>
  );
}

export default DevMode;
