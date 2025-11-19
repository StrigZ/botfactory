'use client';

import useBotForm, { type FieldName } from '~/hooks/use-bot-form';
import type { Bot } from '~/lib/bot-api-client';

import SingleFieldForm from './SingleFieldForm';

type Props = {
  botData: Bot;
  placeholder: string;
  fieldName: FieldName;
};
export default function SingleFieldFormWrapper({
  botData,
  fieldName,
  placeholder,
}: Props) {
  const botForm = useBotForm({
    botData,
    fieldName,
  });

  return (
    <SingleFieldForm
      {...botForm}
      label={fieldName[0]?.toUpperCase() + fieldName.slice(1)}
      fieldName={fieldName}
      placeholder={placeholder}
    />
  );
}
