'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useBotMutations } from '~/hooks/use-bot-mutations';
import type { Bot, UpdateBotInput } from '~/lib/bot-api-client';

import LoadingSpinner from '../components/LoadingSpinner';

const HIDDEN_TOKEN = '**************************';

export type FieldName = keyof UpdateBotInput['data'];
export type BotForm = ReturnType<typeof useBotForm>;
type Props = {
  botData: Bot;
  fieldName: FieldName;
  isFormEditableByDefault?: boolean;
};
export default function useBotForm({
  botData,
  fieldName,
  isFormEditableByDefault = false,
}: Props) {
  const { updateBot, isUpdating } = useBotMutations();
  const [isFieldEditable, setIsFieldEditable] = useState(
    isFormEditableByDefault,
  );
  const formSchema = z.object({
    [fieldName]: z
      .string()
      .min(
        1,
        `${fieldName[0]?.toUpperCase() + fieldName.slice(1)} is required!`,
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      fieldName === 'name' ? { name: botData.name } : { token: HIDDEN_TOKEN },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (isUpdating) {
      return;
    }

    updateBot(
      { id: botData.id, data },
      {
        onSuccess: () => {
          if (fieldName === 'token') {
            form.setValue(fieldName, HIDDEN_TOKEN);
          }

          setIsFieldEditable(false);
        },
      },
    );
  }

  const handleUpdateButtonClick = () => {
    setIsFieldEditable((isEditable) => {
      if (fieldName === 'token') {
        form.setValue(fieldName, isEditable ? HIDDEN_TOKEN : '');
      }
      return !isEditable;
    });
    form.setFocus(fieldName);
  };

  const getSubmitButtonDisplayText = () => {
    if (isUpdating) return <LoadingSpinner />;

    return 'Confirm';
  };

  return {
    onSubmit,
    getButtonDisplayText: getSubmitButtonDisplayText,
    toggleFieldEditable: handleUpdateButtonClick,
    form,
    isUpdating,
    isFieldEditable,
  };
}
