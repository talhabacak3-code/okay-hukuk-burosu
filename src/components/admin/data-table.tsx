import Link from "next/link"

/** Basit, erişilebilir kayıt tablosu. Dar ekranda yatay kaydırılır (sayfa taşmaz). */
export function DataTable({
  caption,
  columns,
  rows,
  empty,
}: {
  caption: string
  columns: string[]
  rows: { key: string; href: string; cells: React.ReactNode[] }[]
  empty: React.ReactNode
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-ink-950/20 p-8 text-sm text-muted-foreground">
        {empty}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-paper-deep">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-t border-border hover:bg-paper-deep/60"
            >
              {row.cells.map((cell, index) => (
                <td key={index} className="px-4 py-3 align-top">
                  {index === 0 ? (
                    <Link
                      href={row.href}
                      className="font-medium underline decoration-stone underline-offset-4 hover:decoration-ink-950"
                    >
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "on" | "off"
  children: React.ReactNode
}) {
  return (
    <span
      className={
        tone === "on"
          ? "inline-flex items-center gap-1.5 text-ink-950 before:size-1.5 before:rounded-full before:bg-stone-deep"
          : "inline-flex items-center gap-1.5 text-muted-foreground before:size-1.5 before:rounded-full before:bg-muted-foreground/50"
      }
    >
      {children}
    </span>
  )
}
