"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
	createPersistentLink,
	getPersistentLinks,
	togglePersistentLinkStatus,
	updatePersistentLink,
	deletePersistentLink,
} from "@/db/queries/persistentRegistrationLink.queries";
import { PersistentRegistrationLink } from "@/db/schema";

const CreatePersistentLinkSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
	description: z.string().optional(),
});

const UpdatePersistentLinkSchema = z.object({
	id: z.string().min(1, "ID is required"),
	title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
	description: z.string().optional(),
});

export type CreatePersistentLinkData = z.infer<typeof CreatePersistentLinkSchema>;
export type UpdatePersistentLinkData = z.infer<typeof UpdatePersistentLinkSchema>;

/**
 * Create a new persistent registration link
 * @param formData - The form data containing the title and description of the link
 * @returns The success status, the link object, and any error messages
 */
export const createPersistentRegistrationLink = async (
	formData: CreatePersistentLinkData,
): Promise<{
	success: boolean;
	link?: PersistentRegistrationLink;
	error?: string | Record<string, string[]>;
}> => {
	try {
		const validatedFields = CreatePersistentLinkSchema.safeParse(formData);

		if (!validatedFields.success) {
			return {
				success: false,
				error: validatedFields.error.flatten().fieldErrors,
			};
		}

		const { title, description } = validatedFields.data;

		const link = await createPersistentLink(title, description);

		revalidatePath("/admin/service-providers/persistent-links");

		return {
			success: true,
			link,
		};
	} catch (error) {
		console.error("Error creating persistent link:", error);
		return {
			success: false,
			error: "Failed to create persistent link. Please try again later.",
		};
	}
};

/**
 * Get all persistent registration links
 * @returns The persistent registration links
 */
export const getPersistentRegistrationLinks = async (): Promise<PersistentRegistrationLink[]> => {
	try {
		return await getPersistentLinks();
	} catch (error) {
		console.error("Error fetching persistent links:", error);
		throw new Error("Failed to fetch persistent links");
	}
};

/**
 * Toggle the active status of a persistent link
 */
export const togglePersistentRegistrationLinkStatus = async (
	id: string,
	isActive: boolean,
): Promise<{
	success: boolean;
	link?: PersistentRegistrationLink;
	message?: string;
}> => {
	try {
		const link = await togglePersistentLinkStatus(id, isActive);

		if (!link) {
			return {
				success: false,
				message: "Link not found",
			};
		}

		revalidatePath("/admin/service-providers/persistent-links");

		return {
			success: true,
			link,
			message: `Link ${isActive ? "activated" : "deactivated"} successfully`,
		};
	} catch (error) {
		console.error("Error toggling link status:", error);
		return {
			success: false,
			message: "Failed to update link status",
		};
	}
};

/**
 * Update a persistent registration link
 * @param formData - The form data containing the title and description of the link
 * @returns The success status, the link object, and any error messages
 */
export const updatePersistentRegistrationLink = async (
	formData: UpdatePersistentLinkData,
): Promise<{
	success: boolean;
	link?: PersistentRegistrationLink;
	error?: string | Record<string, string[]>;
}> => {
	try {
		const validatedFields = UpdatePersistentLinkSchema.safeParse(formData);

		if (!validatedFields.success) {
			return {
				success: false,
				error: validatedFields.error.flatten().fieldErrors,
			};
		}

		const { id, title, description } = validatedFields.data;

		const link = await updatePersistentLink(id, { title, description });

		if (!link) {
			return {
				success: false,
				error: "Link not found",
			};
		}

		revalidatePath("/admin/service-providers/persistent-links");

		return {
			success: true,
			link,
		};
	} catch (error) {
		console.error("Error updating persistent link:", error);
		return {
			success: false,
			error: "Failed to update persistent link. Please try again later.",
		};
	}
};

/**
 * Delete a persistent registration link
 * @param id - The ID of the link to delete
 * @returns The success status and any error messages
 */
export const deletePersistentRegistrationLink = async (
	id: string,
): Promise<{
	success: boolean;
	message?: string;
}> => {
	try {
		const success = await deletePersistentLink(id);

		if (!success) {
			return {
				success: false,
				message: "Link not found",
			};
		}

		revalidatePath("/admin/service-providers/persistent-links");

		return {
			success: true,
			message: "Link deleted successfully",
		};
	} catch (error) {
		console.error("Error deleting persistent link:", error);
		return {
			success: false,
			message: "Failed to delete link",
		};
	}
};
