import React from "react";
import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import {render} from "react-dom";
import {observer, Provider} from "mobx-react";

import "Assets/stylesheets/app.scss";
import * as Stores from "./stores";

import {PageLoader} from "./components/common/Loader";
import Jobs from "Components/jobs/Jobs";
import Form from "Components/ingest/Form";
import LeftNavigation from "Components/LeftNavigation";
import JobDetails from "Components/jobs/JobDetails";
import JobsWrapper from "Components/jobs/JobsWrapper";
import WarningDialog from "Components/WarningDialog";

const appRoutes = [
  {path: "/new", Component: Form},
  {path: "/jobs", Component: Jobs},
  {path: "/jobs/:id", Component: JobDetails},
];

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <div className="app-container">
      <LeftNavigation />
      <main>
        <Switch>
          <Redirect exact from="/" to="/new" />
          {
            appRoutes.map(({path, Component}) => (
              <Route exact={true} key={path} path={path}>
                <JobsWrapper>
                  <Component />
                  <WarningDialog />
                </JobsWrapper>
              </Route>
            ))
          }
        </Switch>
      </main>
    </div>
  );
});

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
