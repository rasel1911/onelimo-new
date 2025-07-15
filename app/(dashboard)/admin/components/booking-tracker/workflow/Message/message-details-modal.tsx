"use client";

import { type ModalProps, type MessageModalData } from "@/lib/workflow/types/modal";

import { MessageFallback } from "./message-fallback";
import { MessageTabs } from "./message-tabs";
import { BaseModal } from "../shared";

interface MessageDetailsModalProps extends ModalProps<MessageModalData> {}

export const MessageDetailsModal = ({ isOpen, onCloseAction, data }: MessageDetailsModalProps) => {
	const analysis = data?.analysis || data?.step?.details?.analysis || null;

	const originalMessage = analysis?.originalMessage || "";
	const improvedMessage = analysis?.refinedMessage || "";
	const cleanedMessage = analysis?.cleanedMessage || improvedMessage;

	const hasAnalysis = analysis && typeof analysis === "object";

	return (
		<BaseModal
			isOpen={isOpen}
			onCloseAction={onCloseAction}
			title="Message Analysis"
			maxWidth="3xl"
			maxHeight="85vh"
		>
			<div className="flex h-[calc(85vh-120px)] min-h-[600px] flex-col gap-0 overflow-hidden">
				{hasAnalysis ? (
					<MessageTabs
						analysis={analysis}
						originalMessage={originalMessage}
						improvedMessage={improvedMessage}
						cleanedMessage={cleanedMessage}
					/>
				) : (
					<MessageFallback originalMessage={originalMessage} improvedMessage={improvedMessage} />
				)}
			</div>
		</BaseModal>
	);
};
