import { eq } from "drizzle-orm";

import db from "@/db/connection";

import { reservation } from "../schema/reservation.schema";

export async function createReservation({
	id,
	userId,
	details,
}: {
	id: string;
	userId: string;
	details: any;
}) {
	return await db.insert(reservation).values({
		id,
		createdAt: new Date(),
		userId,
		hasCompletedPayment: false,
		details: JSON.stringify(details),
	});
}

export async function getReservationById({ id }: { id: string }) {
	const [selectedReservation] = await db.select().from(reservation).where(eq(reservation.id, id));

	return selectedReservation;
}

export async function updateReservation({
	id,
	hasCompletedPayment,
}: {
	id: string;
	hasCompletedPayment: boolean;
}) {
	return await db
		.update(reservation)
		.set({
			hasCompletedPayment,
		})
		.where(eq(reservation.id, id));
}
