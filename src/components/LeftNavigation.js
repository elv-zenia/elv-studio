import React from "react";
import {NavLink} from "react-router-dom";
import ImageIcon from "Components/common/ImageIcon";
import Logo from "Assets/images/logo.png";

const LeftNavigation = () => {
  return (
    <nav className="navigation">
      <div className="navigation__logo-container">
        <ImageIcon icon={Logo} title="Eluvio" className="navigation__logo" />
      </div>
      <NavLink to={"/new"} className="navigation__link">Create</NavLink>
      <NavLink to={"/jobs"} className="navigation__link">Active Jobs</NavLink>
    </nav>
  );
};

export default LeftNavigation;
