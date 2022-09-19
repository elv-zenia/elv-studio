import React from "react";
import {Link} from "react-router-dom";

const Table = ({headers=[], rows=[]}) => {
  if(headers.length < 1 || rows.length < 1) { return null; }

  const TableRowColumns = ({row}) => {
    return row.columns.map(({label="", description="", gridActions}, index) => {
      if(gridActions) {
        return (
          <div key={`row-td-${label}`} className="table__column" />
        );
      }

      return (
        <Link to={`./jobs/${row.id}`} key={`row-td-${index}`} className="table__column">
          <div key={`row-td-${label}`}>
            {label}
            {description}
          </div>
        </Link>
      );
    });
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
            <div
              key={`row-${row.id}`}
              className="table__body__row table__body__row--clickable"
            >
              { TableRowColumns({row}) }
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Table;
