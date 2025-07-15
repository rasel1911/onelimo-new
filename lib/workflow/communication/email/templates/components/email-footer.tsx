import { Section, Row, Column, Text, Hr } from "@react-email/components";
import React from "react";

interface EmailFooterProps {
	companyName: string;
	supportEmail?: string;
	year?: number;
}

const EmailFooter: React.FC<EmailFooterProps> = ({
	companyName,
	supportEmail,
	year = new Date().getFullYear(),
}) => {
	return (
		<Section style={{ marginTop: "16px" }}>
			<Row>
				<Column style={{ textAlign: "center" }}>
					<Hr
						style={{
							margin: "12px 0",
							border: "none",
							borderTop: "1px solid #E5E7EB",
						}}
					/>
					{supportEmail && (
						<Text
							style={{
								margin: "0 0 8px 0",
								fontSize: "12px",
								color: "#6B7280",
								textAlign: "center",
							}}
						>
							Need help? Contact us at{" "}
							<a
								href={`mailto:${supportEmail}`}
								style={{
									color: "#2563EB",
									textDecoration: "none",
								}}
							>
								{supportEmail}
							</a>
						</Text>
					)}
					<Text
						style={{
							margin: "0",
							fontSize: "12px",
							color: "#6B7280",
							textAlign: "center",
						}}
					>
						© {year} {companyName}. All rights reserved.
					</Text>
				</Column>
			</Row>
		</Section>
	);
};

export default EmailFooter;
