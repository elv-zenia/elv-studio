import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";

const FabricLoader = observer(({children}) => {
  const [loading, setLoading] = useState(false);

  const LoadDependencies = async () => {
    await ingestStore.LoadLibraries();
    await ingestStore.LoadAccessGroups();
  };

  useEffect(() => {
    setLoading(true);
    try {
      LoadDependencies();
    } finally {
      setLoading(false);
    }
  }, []);

  if(loading || !ingestStore.libraries || !ingestStore.accessGroups) {
    return <PageLoader />;
  } else {
    return children;
  }
});

export default FabricLoader;
