import { useNavigate } from "react-router-dom";

export function PrintWindow({ title, description, backTo, notice, children }) {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              arrow_back
            </span>
            Volver
          </button>
        </div>

        {notice ? <PrintNotice {...notice} /> : null}

        {children}
      </section>
    </main>
  );
}

export function PrintNotice({ tone = "info", title, detail }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-slate-200 bg-white text-slate-700",
  };

  const detailStyles = {
    info: "text-blue-700",
    error: "text-red-700",
    neutral: "text-slate-500",
  };

  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 ${styles[tone] ?? styles.info}`}>
      <p className="text-sm font-semibold">{title}</p>
      {detail ? <p className={`mt-1 text-xs ${detailStyles[tone] ?? detailStyles.info}`}>{detail}</p> : null}
    </div>
  );
}

export function PrintTable({ columns, colSpan, loading, loadingText, empty, rows, renderRow }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className={`border-b border-slate-200 px-4 py-3 font-semibold text-slate-700 ${column === "Accion" || column === "Acción" ? "text-center" : "text-left"}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan ?? columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                {loadingText ?? "Cargando documentos..."}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan ?? columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PrintButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "0.95rem" }}>
        print
      </span>
      Imprimir
    </button>
  );
}

export function StatusBadge({ value }) {
  const tone =
    value === "IMPRESO" || value === "EMITIDO" || value === "EMITIDA"
      ? "bg-green-100 text-green-800"
      : value === "ANULADO" || value === "ANULADA"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";

  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{value}</span>;
}

export function PreviewModal({ title, onPrint, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-3 rounded-t-xl border-b border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                print
              </span>
              Imprimir / Guardar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
