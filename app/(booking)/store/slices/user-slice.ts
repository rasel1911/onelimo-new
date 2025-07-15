import { StateCreator } from "zustand";

export interface UserData {
	name: string;
	email: string;
	phone: string;
}

export interface UserSlice {
	userData: UserData;
	setUserData: (userData: Partial<UserData>) => void;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
	userData: {
		name: "",
		email: "",
		phone: "",
	},
	setUserData: (userData) =>
		set((state) => ({
			userData: { ...state.userData, ...userData },
		})),
});
