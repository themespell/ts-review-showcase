import TableNav from "./TableNav";
import DataTable from "./DataTable";

function Container({ type, title, editor, hideNav = false }) {
  return (
      <>
          <TableNav type={type} title={title} hidden={hideNav} />

          <div className="w-full rounded-[28px] border border-border bg-card shadow-[var(--shadow-soft)]">
              <DataTable type={type} title={title} editor={editor}/>
          </div>
      </>
  );
}

export default Container;
