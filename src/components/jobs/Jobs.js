import React from "react";
import {Link} from "react-router-dom";

const Jobs = ({jobs}) => {
  jobs = [{id: "123"}]; // TODO
  if(!jobs || !jobs.length) {
    return <div className="page-container">No active jobs.</div>;
  }

  return (
    <div className="page-container">
      <div className="page__header">Active Ingest Jobs</div>
      <div className="jobs">
        {
          jobs.map(job => (
            <Link to={`jobs/${job.id}`} key={job.id} className="jobs__listing">
              <div className="jobs__listing" key={job.id}>{ job.id }</div>
            </Link>
          ))
        }
      </div>
    </div>
  );
};

export default Jobs;
