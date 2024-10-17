import {Box, Flex, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";

const PageContainer = ({
  title,
  children,
  centerTitle=false,
  width="100%"
}) => {
  return (
    <Box p="24 46 46" w={width}>
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
