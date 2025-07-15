"use server";

import { getRegistrationTokens as fetchRegistrationTokens } from "@/db/queries/registrationToken.queries";
import { RegistrationToken } from "@/db/schema";

export async function getInvitationTokens(): Promise<RegistrationToken[]> {
  try {
    const tokens = await fetchRegistrationTokens();
    return tokens;
  } catch (error) {
    console.error("Error fetching invitation tokens:", error);
    throw new Error("Failed to fetch invitation tokens");
  }
} 