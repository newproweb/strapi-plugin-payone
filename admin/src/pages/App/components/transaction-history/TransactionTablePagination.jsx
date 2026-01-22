import { Flex, Box } from "@strapi/design-system";
import { PageSizeURLQuery, PaginationURLQuery } from "@strapi/helper-plugin";

const TransactionHistoryTablePagination = ({ pageCount }) => {
  return (
    <Box paddingTop={6} paddingBottom={4}>
      <Flex
        direction="row"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        wrap="wrap"
      >
        <PageSizeURLQuery
          options={["5", "10", "20", "50", "100"]}
          defaultValue={"10"}
        />
        <PaginationURLQuery
          pagination={{ pageCount }}
          boundaryCount={1}
          siblingCount={1}
        />
      </Flex>
    </Box>
  );
};

export default TransactionHistoryTablePagination;
