import { Section, Row, Column, Heading } from "@react-email/components";
import React from "react";

interface EmailHeaderProps {
	companyName: string;
	bookingId: string;
}

const EmailHeader: React.FC<EmailHeaderProps> = ({ companyName = "Onelimo", bookingId }) => {
	return (
		<Section
			style={{
				backgroundColor: "white",
				border: "1px solid #E5E7EB",
				borderTopLeftRadius: "12px",
				borderTopRightRadius: "12px",
			}}
		>
			<Row>
				<Column style={{ padding: "16px 24px" }}>
					<table width="100%" cellPadding="0" cellSpacing="0">
						<tr>
							<td style={{ verticalAlign: "middle" }}>
								<Heading
									style={{
										margin: "0",
										fontSize: "18px",
										fontWeight: "600",
										color: "#1F2937",
										display: "inline",
									}}
								>
									{companyName}
								</Heading>
							</td>
							<td style={{ textAlign: "right", verticalAlign: "middle" }}>
								<div
									style={{
										backgroundColor: "#2563EB",
										color: "white",
										padding: "6px 12px",
										fontSize: "14px",
										fontWeight: "500",
										borderRadius: "6px",
										display: "inline-block",
									}}
								>
									{bookingId}
								</div>
							</td>
						</tr>
					</table>
				</Column>
			</Row>
		</Section>
	);
};

export default EmailHeader;
