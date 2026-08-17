'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Gamepad2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GameFormState } from './actions';

type GameFormProps = {
  action: (state: GameFormState, formData: FormData) => Promise<GameFormState>;
  cancelHref?: string;
  defaultValues?: {
    name?: string | null;
    description?: string | null;
    targetAudience?: string | null;
    subject?: string | null;
    thumbnailUrl?: string | null;
    playUrl?: string | null;
    sourceUrl?: string | null;
    studies?: string | null;
  };
  gameId?: string;
  organizationId?: string;
  submitLabel?: string;
};

const initialState: GameFormState = {};
const inputClass =
  'h-11 rounded-md border bg-card px-3 text-base text-foreground shadow-ogd-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20';
const textAreaClass =
  'min-h-28 rounded-md border bg-card px-3 py-3 text-base leading-7 text-foreground shadow-ogd-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20';

function Field({
  children,
  description,
  label,
  required = false,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {label}
        <span className="rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold uppercase leading-none text-muted-foreground">
          {required ? 'Required' : 'Optional'}
        </span>
      </span>
      {description ? <span className="text-sm leading-6 text-muted-foreground">{description}</span> : null}
      {children}
    </label>
  );
}

export function GameForm({
  action,
  cancelHref = '/games',
  defaultValues,
  gameId,
  organizationId,
  submitLabel = 'Create game',
}: GameFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSaveAction = submitLabel.toLowerCase().includes('save');

  return (
    <form action={formAction} className="max-w-3xl">
      {organizationId ? <input type="hidden" name="organizationId" value={organizationId} /> : null}
      {gameId ? <input type="hidden" name="gameId" value={gameId} /> : null}

      <div className="grid gap-7">
        <Field
          label="Game title"
          description="The human-readable title that will appear across OGD surfaces."
          required
        >
          <input
            autoFocus
            className={inputClass}
            defaultValue={defaultValues?.name ?? ''}
            maxLength={160}
            minLength={2}
            name="name"
            placeholder="Enter game title"
            required
            type="text"
          />
        </Field>

        <Field label="Game description" description="A 1-2 sentence summary of the game." required>
          <textarea
            className={textAreaClass}
            defaultValue={defaultValues?.description ?? ''}
            maxLength={2000}
            name="description"
            placeholder="Enter a short game description"
            required
          />
        </Field>

        <div className="grid gap-7 sm:grid-cols-2">
          <Field label="Target audience" description="Optional age range or school grades.">
            <input
              className={inputClass}
              defaultValue={defaultValues?.targetAudience ?? ''}
              maxLength={160}
              name="targetAudience"
              placeholder="Enter audience"
            />
          </Field>
          <Field label="Subject" description="Optional closest school subject match.">
            <input
              className={inputClass}
              defaultValue={defaultValues?.subject ?? ''}
              maxLength={160}
              name="subject"
              placeholder="Enter subject"
            />
          </Field>
        </div>

        <Field label="Play link" description="A link to a playable copy of the game." required>
          <input
            className={inputClass}
            defaultValue={defaultValues?.playUrl ?? ''}
            name="playUrl"
            placeholder="https://example.com/play"
            required
            type="url"
          />
        </Field>

        <div className="grid gap-7 sm:grid-cols-2">
          <Field label="Source link" description="Optional source repository link.">
            <input
              className={inputClass}
              defaultValue={defaultValues?.sourceUrl ?? ''}
              name="sourceUrl"
              placeholder="https://example.com/source"
              type="url"
            />
          </Field>
          <Field label="Thumbnail image URL" description="Optional image URL for the game page.">
            <input
              className={inputClass}
              defaultValue={defaultValues?.thumbnailUrl ?? ''}
              name="thumbnailUrl"
              placeholder="https://example.com/image.png"
              type="url"
            />
          </Field>
        </div>

        <Field label="Studies" description="Optional references for studies using this game.">
          <textarea
            className={textAreaClass}
            defaultValue={defaultValues?.studies ?? ''}
            maxLength={4000}
            name="studies"
            placeholder="Enter study references"
          />
        </Field>
      </div>

      {state.error ? <p className="mt-5 text-sm font-semibold text-destructive">{state.error}</p> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <Button disabled={pending} type="submit">
          {isSaveAction ? <Save className="size-4" /> : <Gamepad2 className="size-4" />}
          {pending ? 'Saving...' : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
