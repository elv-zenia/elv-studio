import React from "react";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import {render} from "react-dom";
import {Provider} from "mobx-react";

import "Assets/stylesheets/app.scss";
import * as Stores from "./stores";

import {PageLoader} from "./components/common/Loader";
import Jobs from "Components/ingest/Jobs";
import Form from "Components/ingest/Form";
import LeftNavigation from "Components/LeftNavigation";

const appRoutes = [
  {path: "/", element: <Navigate replace to="/jobs" />},
  {path: "/jobs", element: <Jobs />},
  {path: "/new", element: <Form />}
];

const App = () => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <div className="app-container">
      <LeftNavigation />
      <main>
        <Routes>
          {
            appRoutes.map(({path, element}) => (
              <Route exact={true} key={path} path={path} element={element} />
            ))
          }
        </Routes>
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
