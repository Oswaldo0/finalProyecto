const TABLE_HEADERS = ["ID", "Horario de clase", "Grupo", "Materia", "Docente"];

export function DataTable({ rows = [] }) {
  const hasRows = rows.length > 0;

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Tabla de datos"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Datos del sistema
      </h2>

      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="border border-slate-200 bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.id}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.schedule}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.group}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.subject}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.teacher}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={TABLE_HEADERS.length}
                  className="border border-slate-200 px-3 py-3 text-center text-slate-500"
                ></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {hasRows ? (
          rows.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <dl className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                  <dt className="font-medium text-slate-500">ID</dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {row.id}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-medium text-slate-500">
                    Horario de clase
                  </dt>
                  <dd className="text-right text-slate-800">{row.schedule}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-medium text-slate-500">Grupo</dt>
                  <dd className="text-right text-slate-800">{row.group}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-medium text-slate-500">Materia</dt>
                  <dd className="text-right text-slate-800">{row.subject}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-medium text-slate-500">Docente</dt>
                  <dd className="text-right text-slate-800">{row.teacher}</dd>
                </div>
              </dl>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          </div>
        )}
      </div>
    </section>
  );
}
