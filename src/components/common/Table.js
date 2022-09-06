import React from "react";
import {Link} from "react-router-dom";

const Table = ({headers=[], rows=[]}) => {
  if(!headers || !rows) { return null; }

  const TableRowColumns = ({row}) => {
    return row.cells.map(({label, description=""}) => (
      <div key={`row-td-${label}`} className="table__column">
        { label }
        { description }
      </div>
    ));
  };

  return (
    <div className="table">
      <div className="table__head">
        {
          headers.map(row => (
            <div key={row.key} className="table__head__row">
              { TableRowColumns({row}) }
            </div>
          ))
        }
      </div>
      <div className="table__body">
        {
          rows.map((row) => (
            <Link to={`./jobs/${row.id}`} key={`row-${row.id}`} className="table__body__row table__body__row--clickable" role="tr">
              { TableRowColumns({row}) }
            </Link>
          ))
        }
      </div>
    </div>
  );
};

export default Table;
