import { motion } from "framer-motion";

import { ConciergeIcon } from "@/components/custom/icons";

export const TypingIndicator = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex gap-3"
		>
			{/* Avatar */}
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<ConciergeIcon size={16} />
				<span className="sr-only">OL</span>
			</div>

			{/* Typing animation */}
			<div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
				<span className="text-sm text-muted-foreground">
					{"Typing".split("").map((char, index) => (
						<motion.span
							key={index}
							animate={{
								y: [0, -3, 0],
								opacity: [0.7, 1, 0.7],
							}}
							transition={{
								duration: 1.8,
								repeat: Infinity,
								delay: index * 0.12,
								ease: "easeInOut",
							}}
							style={{ display: "inline-block" }}
						>
							{char}
						</motion.span>
					))}
				</span>
				<div className="flex space-x-1">
					<motion.div
						className="size-2 rounded-full bg-muted-foreground"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							delay: 0,
						}}
					/>
					<motion.div
						className="size-2 rounded-full bg-muted-foreground"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							delay: 0.2,
						}}
					/>
					<motion.div
						className="size-2 rounded-full bg-muted-foreground"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							delay: 0.4,
						}}
					/>
				</div>
			</div>
		</motion.div>
	);
};
