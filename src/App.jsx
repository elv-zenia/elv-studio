import {PageLoader} from "@/components/common/Loader.jsx";
import {HashRouter} from "react-router-dom";
import JobsWrapper from "@/pages/jobs/JobsWrapper.jsx";
import {observer} from "mobx-react-lite";
import LeftNavigation from "@/components/LeftNavigation.jsx";
import WarningDialog from "@/components/WarningDialog.jsx";
import {rootStore} from "@/stores/index.js";
import AppRoutes from "./Routes.jsx";
import {MantineProvider} from "@mantine/core";
import "@mantine/core/styles.css";

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <MantineProvider withCssVariables>
      <HashRouter>
        <div className="app-container">
          <LeftNavigation />
          <main>
            <JobsWrapper>
              <AppRoutes />
            </JobsWrapper>
            <WarningDialog />
          </main>
        </div>
      </HashRouter>
    </MantineProvider>
  );
});

export default App;
