import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Marketplace de camisetas
      </Heading>
      <Text mb={4}>Compra y vende camisetas, buzos, shorts y camperas.</Text>
      <Button as={Link} to="/catalogo" colorScheme="teal">
        Ver catálogo
      </Button>
    </Box>
  );
}
