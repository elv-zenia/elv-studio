import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";

const LibraryWrapper = observer(({children}) => {
  const [loading, setLoading] = useState(false);

  const LoadLibraries = async () => {
    await ingestStore.LoadLibraries();
  };

  useEffect(() => {
    setLoading(true);
    try {
      LoadLibraries();
    } finally {
      setLoading(false);
    }
  }, []);

  if(loading) { return <PageLoader />; }

  return children;
});

export default LibraryWrapper;
