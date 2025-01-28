import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores";
import {Loader} from "@mantine/core";

const FabricLoader = observer(({children}) => {
  const LoadDependencies = async () => {
    await ingestStore.LoadDependencies();
  };

  useEffect(() => {
    LoadDependencies();
  }, []);

  if(!ingestStore.loaded) {
    return <Loader />;
  } else {
    return children;
  }
});

export default FabricLoader;
