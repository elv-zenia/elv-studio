import {Alert, Box, Flex, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";
import {useEffect, useRef} from "react";

const AlertMessage = ({error}) => {
  const errorRef = useRef(null);

  useEffect(() => {
    if(errorRef && errorRef.current) {
      errorRef.current.scrollIntoView();
    }
  }, [error]);

  if(!error) { return null; }

  const {title, message} = error;

  return (
    <Box ref={errorRef} mb={16}>
      <Alert
        variant="light"
        color="elv-red.4"
        title={title}
        withCloseButton
      >
        { message }
      </Alert>
    </Box>
  );
};


const PageContainer = ({
  title,
  children,
  centerTitle=false,
  width="100%",
  error
}) => {
  return (
    <Box p="24 46 46" w={width}>
      <AlertMessage error={error} />
      {
        title &&
        <Flex justify={centerTitle ? "center" : "flex-start"}>
          <Title order={3} classNames={{root: styles.root}} mb={24}>
            { title }
          </Title>
        </Flex>
      }
      { children }
    </Box>
  );
};

export default PageContainer;
