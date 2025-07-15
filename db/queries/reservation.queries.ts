import { eq } from "drizzle-orm";

import db from "@/db/connection";

import { reservation } from "../schema/reservation.schema";

/**
 * Create a reservation
 * @param id - The id of the reservation
 * @param userId - The id of the user
 * @param details - The details of the reservation
 * @returns The created reservation
 */
export const createReservation = async ({
	id,
	userId,
	details,
}: {
	id: string;
	userId: string;
	details: any;
}) => {
	return await db.insert(reservation).values({
		id,
		createdAt: new Date(),
		userId,
		hasCompletedPayment: false,
		details: JSON.stringify(details),
	});
};

/**
 * Get a reservation by id
 * @param id - The id of the reservation
 * @returns The reservation
 */
export const getReservationById = async ({ id }: { id: string }) => {
	const [selectedReservation] = await db.select().from(reservation).where(eq(reservation.id, id));

	return selectedReservation;
};

/**
 * Update a reservation
 * @param id - The id of the reservation
 * @param hasCompletedPayment - Whether the reservation has completed payment
 * @returns The updated reservation
 */
export const updateReservation = async ({
	id,
	hasCompletedPayment,
}: {
	id: string;
	hasCompletedPayment: boolean;
}) => {
	return await db
		.update(reservation)
		.set({
			hasCompletedPayment,
		})
		.where(eq(reservation.id, id));
};
