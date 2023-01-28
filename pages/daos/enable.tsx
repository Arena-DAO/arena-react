import {
  AutoForm,
  FormLayout,
  Form,
  ArrayField,
  ArrayFieldContainer,
  ArrayFieldRows,
  ArrayFieldRowContainer,
  ArrayFieldRowFields,
  ArrayFieldAddButton,
  ArrayFieldRemoveButton,
  useArrayFieldContext,
  useArrayFieldRowContext,
  useArrayFieldAddButton,
  useArrayFieldRemoveButton,
  FormStepper,
  StepForm,
  useForm,
  SubmitButton,
  Field,
} from "@saas-ui/react";
import { yupResolver } from "@saas-ui/forms/yup";
import {
  Duration,
  PercentageThreshold,
  InstantiateMsg as ProposalMultipleInstantiateMsg,
} from "ts-codegen/dao/DaoProposalMultiple.types";
import {
  InstantiateMsg as AgonCoreInstantiateMsg,
  ModuleInstantiateInfo,
  Ruleset,
} from "ts-codegen/agon/AgonCore.types";
import * as Yup from "yup";

export default function EnableAgon() {
  const schema = Yup.object().shape({
    dao: Yup.string().label("DAO"),
    allow_revoting: Yup.bool().label("Allow Revoting"),
    close_proposal_on_execution_failure: Yup.bool().label(
      "Close Proposal on Execution Failure"
    ),
    max_voting_period: Yup.number().integer().label("Max Voting Period"),
    max_voting_period_units: Yup.mixed().oneOf(["height", "time"]),
    min_voting_period: Yup.number()
      .integer()
      .nullable()
      .label("Min Voting Period"),
    min_voting_period_units: Yup.mixed().oneOf(["height", "time"]),
    only_members_execute: Yup.bool().label("Only Members Execute"),
    voting_threshold: Yup.mixed().oneOf(["majority", "percentage"]),
    voting_threshold_percentage: Yup.number().label("Percentage"),
    rulesets: Yup.array().of(
      Yup.object().shape({
        description: Yup.string().label("Description"),
        rules: Yup.array().of(Yup.string()),
      })
    ),
    //competition_modules_instantiate_info: [] as ModuleInstantiateInfo[],
  });
  const onSubmit = async (params: any) => {
    console.log(params);
  };

  return (
    <Form resolver={yupResolver(schema)} onSubmit={() => Promise.resolve()}>
      <FormLayout>
        <ArrayField name="rulesets" label="Rulesets" defaultValue={{}}>
          <Field
            type="textarea"
            name="description"
            placeholder="Description"
            marginBottom={"auto"}
            label="Description"
          />
          <ArrayField name="rules" label="Rules">
            <Field name="rule" placeholder="Rule" />
          </ArrayField>
        </ArrayField>

        <SubmitButton label="Submit" />
      </FormLayout>
    </Form>
  );
}
