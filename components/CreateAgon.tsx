import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import {
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikProps,
  withFormik,
} from "formik";
import { InstantiateMsg } from "ts-codegen/agon/AgonCore.types";
import { toBinary } from "cosmwasm";
import { ExecuteMsg } from "ts-codegen/dao/DaoCore.types";
import { PropsWithChildren } from "react";

function InnerForm(props: FormikProps<InstantiateMsg>) {
  const { touched, errors, isSubmitting } = props;
  return (
    <Form>
      <SimpleGrid columns={12} spacing={4} my={4}>
        <FormControl
          as={GridItem}
          colSpan={{ base: 12, lg: 6, xl: 4 }}
          isInvalid={!!errors.dao && touched.dao}
        >
          <FormLabel htmlFor="dao">DAO Address</FormLabel>
          <Field
            as={Input}
            type="text"
            name="dao"
            focusBorderColor="secondary.400"
          />
          <FormErrorMessage>{errors.dao}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
      <Box
        px={{
          base: 4,
          sm: 6,
        }}
        py={3}
        textAlign="right"
      >
        <Button type="submit" colorScheme="secondary" isLoading={isSubmitting}>
          Submit
        </Button>
      </Box>
    </Form>
  );
}

const MyForm = withFormik({
  // Add a custom validation function (this can be async too!)
  validate: (values: InstantiateMsg) => {
    let errors: FormikErrors<InstantiateMsg> = {};
    if (!values.dao) {
      errors.dao = "Required";
    }
    return errors;
  },

  handleSubmit: (values: InstantiateMsg) => {},
})(InnerForm);

export default function CreateAgon({ children }: PropsWithChildren) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const msg: InstantiateMsg = {
    competition_modules_instantiate_info: [],
    rulesets: [],
  };

  return (
    <Formik
      onSubmit={(values, actions) => {
        console.log({ values, actions });
        alert(JSON.stringify(values, null, 2));
        actions.setSubmitting(false);
      }}
      initialValues={msg}
    >
      <Button onClick={onOpen}>Open Modal</Button> render this as a child
      instead and put the modal outside of the form
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create the Agon module</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <MyForm />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Formik>
  );
}
