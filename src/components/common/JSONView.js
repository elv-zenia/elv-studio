import React from "react";
import {Copyable} from "Components/common/Copyable";

const JSONView = ({json, copyable=false}) => {
  return (
    <pre className="json-view">
      <span className="json-view__data">{ json }</span>
      {
        copyable &&
        <div className="json-view__copy-button">
          <Copyable copy={json} />
        </div>
      }
    </pre>
  );
};

export default JSONView;
