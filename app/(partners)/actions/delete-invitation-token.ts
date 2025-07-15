'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { registrationToken } from '@/db/schema';

/**
 * Delete a specific registration token by ID
 * @param id The ID of the token to delete
 * @returns Success status and message
 */
export async function deleteInvitationToken(id: string) {
  try {
    // Delete the token
    const result = await db
      .delete(registrationToken)
      .where(eq(registrationToken.id, id))
      .returning({ id: registrationToken.id });
    
    if (result.length === 0) {
      return {
        success: false,
        message: 'Token not found'
      };
    }
    
    return {
      success: true,
      message: 'Token deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting invitation token:', error);
    return {
      success: false,
      message: 'Failed to delete token'
    };
  }
} 