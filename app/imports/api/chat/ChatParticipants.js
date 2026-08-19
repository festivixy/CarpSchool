import { Chats } from "./Chat";

/**
 * Resync a ride chat's Participants with the ride's current driver + riders.
 *
 * Chats.Participants is a denormalized snapshot taken when the chat is created,
 * and the ride join/leave paths only touch Rides.riders. Without this resync a
 * rider who joins after the chat exists is rejected by chats.sendMessage and is
 * never sent the chat by the "chats" publication.
 *
 * No-op when the ride has no chat yet.
 */
export async function syncChatParticipants(ride) {
  if (!ride) {
    return;
  }

  const chat = await Chats.findOneAsync({ rideId: ride._id });
  if (!chat) {
    return;
  }

  const expected = [...new Set(
    [ride.driver, ...(ride.riders || [])].filter(Boolean),
  )];
  const current = chat.Participants || [];

  const unchanged = expected.length === current.length
    && expected.every(id => current.includes(id));
  if (unchanged) {
    return;
  }

  await Chats.updateAsync(chat._id, { $set: { Participants: expected } });
}
