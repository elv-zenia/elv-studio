import {observer} from "mobx-react-lite";
import {Navigate, Route, Routes} from "react-router-dom";
import Jobs from "@/pages/jobs/Jobs.jsx";
import JobDetails from "@/pages/job-details/JobDetails.jsx";
import Create from "@/pages/create/Create.jsx";

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/new" />} />
      <Route path="/new" element={<Create />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
    </Routes>
  );
});

export default AppRoutes;
