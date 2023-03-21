import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";

const FabricLoader = observer(({children}) => {
  const LoadDependencies = async () => {
    await ingestStore.LoadDependencies();
  };

  useEffect(() => {
    LoadDependencies();
  }, []);

  if(!ingestStore.loaded) {
    return <PageLoader />;
  } else {
    return children;
  }
});

export default FabricLoader;
