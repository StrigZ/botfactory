'use client';

import type { BotForm, FieldName } from '~/hooks/use-bot-form';

import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

type Props = { label: string; fieldName: FieldName; placeholder: string };

export default function SingleFieldForm({
  onSubmit,
  getButtonDisplayText,
  toggleFieldEditable,
  form,
  label,
  isUpdating,
  fieldName,
  placeholder,
  isFieldEditable,
}: BotForm & Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input
                  className="placeholder:text-muted-foreground/50 placeholder:text-xs"
                  placeholder={placeholder}
                  disabled={!isFieldEditable}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {isFieldEditable && (
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={!isFieldEditable}
            >
              {getButtonDisplayText()}
            </Button>
          )}

          <Button
            className="cursor-pointer"
            type="button"
            variant={isFieldEditable ? 'destructive' : 'default'}
            onClick={toggleFieldEditable}
            disabled={isUpdating}
          >
            {isFieldEditable ? 'Cancel' : `Update ${label.toLowerCase()}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
