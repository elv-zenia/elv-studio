import React from "react";
import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import {render} from "react-dom";
import {Provider} from "mobx-react";

import "Assets/stylesheets/app.scss";
import * as Stores from "./stores";

import {PageLoader} from "./components/common/Loader";
import Jobs from "Components/ingest/Jobs";
import Form from "Components/ingest/Form";
import LeftNavigation from "Components/LeftNavigation";
import JobDetails from "Components/ingest/JobDetails";

const appRoutes = [
  {path: "/new", Component: Form},
  {path: "/jobs", Component: Jobs},
  {path: "/jobs/:id", Component: JobDetails},
];

const App = () => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <div className="app-container">
      <LeftNavigation />
      <main>
        <Switch>
          <Redirect exact from="/" to="/jobs" />
          {
            appRoutes.map(({path, Component}) => (
              <Route exact={true} key={path} path={path}>
                <Component />
              </Route>
            ))
          }
        </Switch>
      </main>
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
