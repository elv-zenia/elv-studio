import {NavLink} from "react-router-dom";

const LeftNavigation = () => {
  return (
    <nav className="navigation">
      <NavLink to={"/new"} className="navigation__link">Create</NavLink>
      <NavLink to={"/jobs"} className="navigation__link">Jobs</NavLink>
    </nav>
  );
};

export default LeftNavigation;
