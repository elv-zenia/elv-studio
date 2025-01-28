import {BrowserRouter} from "react-router-dom";
import {observer} from "mobx-react-lite";
import AppRoutes from "./Routes.jsx";

import SideNavigation from "@/components/side-navigation/SideNavigation.jsx";
import WarningDialog from "@/components/WarningDialog.jsx";
import JobsWrapper from "@/pages/jobs/wrapper/JobsWrapper.jsx";
import {rootStore, uiStore} from "@/stores/index.js";
import MantineTheme from "@/assets/MantineTheme.js";

import {AppShell, Loader, MantineProvider} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "mantine-datatable/styles.css";

const App = observer(() => {
  return (
    <MantineProvider withCssVariables theme={{colorScheme: uiStore.theme, ...MantineTheme}}>
      <BrowserRouter>
        <AppShell
          padding={0}
          navbar={{width: 70, breakpoint: "sm"}}
        >
          <SideNavigation />
          <AppShell.Main>
            {
              rootStore.loaded ?
                (
                  <JobsWrapper>
                    <AppRoutes />
                  </JobsWrapper>
                ) : <Loader />
            }
            <WarningDialog />
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
});

export default App;
