import React from "react";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import {render} from "react-dom";
import {Provider} from "mobx-react";

import "Assets/stylesheets/app.scss";
import * as Stores from "./stores";

import {PageLoader} from "./components/common/Loader";
import IngestJobs from "./components/IngestJobs";
import IngestForm from "./components/IngestForm";
import LeftNavigation from "Components/LeftNavigation";

const appRoutes = [
  {path: "/", element: <Navigate replace to="/jobs" />},
  {path: "/jobs", element: <IngestJobs />},
  {path: "/new", element: <IngestForm />}
];

const App = () => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <div className="app-container">
      <LeftNavigation />
      <Routes>
        {
          appRoutes.map(({path, element}) => (
            <Route exact={true} key={path} path={path} element={element} />
          ))
        }
      </Routes>
    </div>
  );
};

render(
  <Provider {...Stores}>
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  </Provider>,
  document.getElementById("app")
);
