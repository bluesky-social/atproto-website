import Link from 'next/link'

interface ResponsiveTableProps {
  columns: ResponsiveTableItemProps[]
  rows: ResponsiveTableItemProps[][]
}

interface ResponsiveTableItemProps {
  label: string
  href?: string
}

export function ResponsiveTable(props: ResponsiveTableProps) {
  return (
    <>
      <table className="hidden md:table">
        <thead>
          <tr>
            {props.columns.map((col) => (
              <th>
                <ResponsiveTableItem {...col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr>
              {row.map((item) => (
                <td>
                  <ResponsiveTableItem {...item} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {props.rows.map((row) => (
        <table className="rounded-md ring-1 ring-zinc-200 md:hidden dark:ring-zinc-700">
          <tbody>
            {row.map((item, i) =>
              i === 0 ? (
                <tr>
                  <td colSpan={2} className="pl-3 text-xl font-medium">
                    <ResponsiveTableItem className="font-medium" {...item} />
                  </td>
                </tr>
              ) : (
                <tr>
                  <th className="w-1/2 pl-3">
                    <ResponsiveTableItem {...props.columns[i]} />
                  </th>
                  <td>
                    <ResponsiveTableItem {...item} />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      ))}
    </>
  )
}

function ResponsiveTableItem(
  props: ResponsiveTableItemProps & { className?: string },
) {
  if (props.href) {
    return (
      <Link className={props.className} href={props.href}>
        {props.label}
      </Link>
    )
  }
  return <>{props.label}</>
}
