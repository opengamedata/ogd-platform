'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { createGame, updateGame } from '@/server/modules/games/service';
import { createGameSchema, updateGameSchema } from '@/server/modules/validation';

export type GameFormState = {
  error?: string;
};

function formError(error: unknown): GameFormState {
  if (error instanceof ZodError) {
    return { error: error.issues[0]?.message ?? 'Check the game details.' };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: 'Something went wrong. Try again.' };
}

export async function createGameAction(
  _state: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  let gameId: string;

  try {
    const user = await requireCurrentUser();
    const organizationId = String(formData.get('organizationId') ?? '');
    const body = createGameSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      targetAudience: formData.get('targetAudience'),
      subject: formData.get('subject'),
      thumbnailUrl: formData.get('thumbnailUrl'),
      playUrl: formData.get('playUrl'),
      sourceUrl: formData.get('sourceUrl'),
      studies: formData.get('studies'),
    });

    const game = await createGame({
      organizationId,
      actorUserId: user.id,
      name: body.name,
      description: body.description || undefined,
      targetAudience: body.targetAudience || undefined,
      subject: body.subject || undefined,
      thumbnailUrl: body.thumbnailUrl || undefined,
      playUrl: body.playUrl || undefined,
      sourceUrl: body.sourceUrl || undefined,
      studies: body.studies || undefined,
      lifecycleStatus: body.lifecycleStatus,
      privacyClassification: body.privacyClassification,
      releaseStatus: body.releaseStatus,
    });

    gameId = game.id;
  } catch (error) {
    return formError(error);
  }

  revalidatePath('/games');
  redirect(`/games/${gameId}`);
}

export async function updateGameAction(
  _state: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  let gameId: string;

  try {
    const user = await requireCurrentUser();
    gameId = String(formData.get('gameId') ?? '');
    const body = updateGameSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      targetAudience: formData.get('targetAudience'),
      subject: formData.get('subject'),
      thumbnailUrl: formData.get('thumbnailUrl'),
      playUrl: formData.get('playUrl'),
      sourceUrl: formData.get('sourceUrl'),
      studies: formData.get('studies'),
    });

    await updateGame({
      gameId,
      actorUserId: user.id,
      name: body.name,
      description: body.description,
      targetAudience: body.targetAudience,
      subject: body.subject,
      thumbnailUrl: body.thumbnailUrl,
      playUrl: body.playUrl,
      sourceUrl: body.sourceUrl,
      studies: body.studies,
    });
  } catch (error) {
    return formError(error);
  }

  revalidatePath('/games');
  revalidatePath(`/games/${gameId}`);
  redirect(`/games/${gameId}`);
}
