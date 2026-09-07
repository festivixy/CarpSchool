import { Chats } from "./Chat";

/**
 * Resync a ride chat's Participants with the ride's current driver + riders.
 *
 * Chats.Participants is a denormalized snapshot taken when the chat is created,
 * and the ride join/leave paths only touch Rides.riders. Without this resync a
 * rider who joins after the chat exists is rejected by chats.sendMessage and is
 * never sent the chat by the "chats" publication.
 *
 * Adds and removes individual ids ($addToSet / $pull) rather than replacing
 * the array, so two concurrent resyncs (a join and a leave landing together)
 * cannot overwrite each other's change.
 *
 * No-op when the ride has no chat yet.
 */
export async function syncChatParticipants(ride) {
  if (!ride) {
    return;
  }

  const chat = await Chats.findOneAsync({ rideId: ride._id }, { fields: { Participants: 1 } });
  if (!chat) {
    return;
  }

  const expected = [...new Set(
    [ride.driver, ...(ride.riders || [])].filter(Boolean),
  )];
  const current = chat.Participants || [];

  const toAdd = expected.filter(id => !current.includes(id));
  const toRemove = current.filter(id => !expected.includes(id));

  if (toAdd.length > 0) {
    await Chats.updateAsync(chat._id, { $addToSet: { Participants: { $each: toAdd } } });
  }
  if (toRemove.length > 0) {
    await Chats.updateAsync(chat._id, { $pull: { Participants: { $in: toRemove } } });
  }
}
