import {endpoints} from '../endpoints';
import {authorizedRequest} from '../utils';

export async function markAudioViewed(
  token: string,
  audioId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioViews.markViewed(audioId), {
    method: 'POST',
  });
}
