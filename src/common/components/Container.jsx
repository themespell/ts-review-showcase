import TableNav from "./TableNav";
import DataTable from "./DataTable";

function Container({ type, title, editor }) {
  return (
      <>
          <TableNav type={type} title={title}/>
          {/*<div className="w-full bg-white p-6 rounded-lg shadow-lg">*/}
          {/*    <DataTable type={type} title={title} editor={editor}/>*/}
          {/*</div>*/}

          <div className="w-full bg-white rounded-xl">
              <DataTable type={type} title={title} editor={editor}/>
          </div>
      </>
  );
}

export default Container;