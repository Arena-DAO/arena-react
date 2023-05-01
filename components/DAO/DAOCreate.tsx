import { FormLayout, Field, DisplayIf, FormLayoutProps } from "@saas-ui/forms";

export default function DAOCreate() {
  return (
    <FormLayout>
      <FormLayout columns={2}>
        <Field
          type="switch"
          name="allow_revoting"
          defaultChecked={true}
          label="Allow Revoting"
        />
        <Field
          type="switch"
          name="close_proposal_on_execution_failure"
          defaultChecked={true}
          label="Close Proposal on Execution Failure"
        />
      </FormLayout>
      <FormLayout templateColumns="auto 25%">
        <Field
          name="max_voting_period"
          defaultValue={604800}
          label="Max Voting Period"
        />
        <Field
          type="select"
          name="max_voting_period_units"
          defaultValue="Time"
          label="Units"
          options={[{ value: "Time" }, { value: "Height" }]}
        />
      </FormLayout>
      <FormLayout templateColumns="auto 25%">
        <Field name="min_voting_period" label="Min Voting Period" />
        <Field
          type="select"
          name="min_voting_period_units"
          defaultValue="Time"
          label="Units"
          options={[{ value: "Time" }, { value: "Height" }]}
        />
      </FormLayout>
    </FormLayout>
  );
}
