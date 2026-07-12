"use client";
import { withTheme } from "@rjsf/core";
import { Theme as shadcnTheme } from "@rjsf/shadcn";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useAssistantToolUI, useAui } from "@assistant-ui/react";
import { jsonToPlainText } from "json-to-plain-text";
import { useMemo } from "react";
import { claudeCodeToolName } from "@/lib/ai/tools/tool-names";

interface FormToolProps {
  schema: RJSFSchema;
  question: string;
}

function FormTool(props: FormToolProps) {
  const Form = withTheme(shadcnTheme);
  const aui = useAui();
  const schema = useMemo(
    () => ({ title: props.question, ...props.schema }),
    [props.question, props.schema]
  );

  const onSubmit: React.ComponentProps<typeof Form>["onSubmit"] = (e) => {
    const prettyJson = jsonToPlainText(e.formData, {
      doubleQuotesForKeys: true,
      doubleQuotesForValues: true,
      spacing: true,
    });
    const text = `Answer: 
    ${prettyJson}`;

    aui.thread().composer().setText(text);
    aui.thread().composer().send();
  };

  return <Form schema={schema} validator={validator} onSubmit={onSubmit} />;
}

export function FormToolComponent() {
  useAssistantToolUI({
    toolName: claudeCodeToolName("askForClarification"),
    render: function AskForClarification({ args }) {
      return <FormTool schema={args.jsonSchema} question={args.question} />;
    },
  });
  return <></>;
}
