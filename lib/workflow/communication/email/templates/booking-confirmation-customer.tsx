import { Section, Row, Column, Heading, Text, Button, Hr } from "@react-email/components";
import { CheckCircle, Calendar, Clock, Car, MapPin, Phone, Mail, Star } from "lucide-react";
import * as React from "react";

import { formatStatusText } from "@/lib/utils/formatting";
import { CustomerConfirmationEmailProps } from "@/lib/workflow/types/communication";

import EmailFooter from "./components/email-footer";
import EmailHeader from "./components/email-header";
import EmailLayout from "./components/email-layout";

const CustomerConfirmationEmailTemplate: React.FC<CustomerConfirmationEmailProps> = (props) => {
	const previewText = `Your booking is confirmed - ${props.bookingDate} at ${props.bookingTime}`;

	return (
		<EmailLayout previewText={previewText}>
			<EmailHeader companyName={props.companyName} bookingId={props.bookingId} />

			<Section
				style={{
					backgroundColor: "white",
					borderLeft: "1px solid #E5E7EB",
					borderRight: "1px solid #E5E7EB",
				}}
			>
				<Row>
					<Column style={{ padding: "16px 24px" }}>
						<Text
							style={{
								margin: "0 0 16px 0",
								fontSize: "14px",
								color: "#1F2937",
								fontWeight: "600",
							}}
						>
							Hello {props.customerName || "Dear"},
						</Text>

						<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "16px" }}>
							<tr>
								<td style={{ verticalAlign: "top" }}>
									<Heading
										style={{
											margin: "0 0 4px 0",
											fontSize: "18px",
											fontWeight: "600",
											color: "#1F2937",
										}}
									>
										<CheckCircle
											size={20}
											style={{ color: "#10B981", verticalAlign: "middle", marginRight: "8px" }}
										/>
										Your Booking is Confirmed!
									</Heading>
									<Text
										style={{
											margin: "0",
											fontSize: "14px",
											color: "#6B7280",
										}}
										>
											We&apos;ve matched you with a great service provider. Your {formatStatusText(props.serviceType)}{" "}
										is all set!
									</Text>
								</td>
							</tr>
						</table>

						{/* Provider Details */}
						<Section
							style={{
								backgroundColor: "#F0FDF4",
								border: "1px solid #DCFCE7",
								borderRadius: "12px",
								padding: "16px",
								marginBottom: "16px",
							}}
						>
							<Text
								style={{
									margin: "0 0 12px 0",
									fontSize: "14px",
									fontWeight: "600",
									color: "#111827",
								}}
							>
								Your Service Provider
							</Text>

							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td style={{ paddingBottom: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Text
														style={{
															margin: "0",
															fontSize: "16px",
															fontWeight: "600",
															color: "#111827",
														}}
													>
														{props.providerName}
													</Text>
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td style={{ paddingBottom: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Phone size={14} style={{ color: "#6366F1" }} />
												</td>
												<td>
													<a
														href={`tel:${props.providerPhone}`}
														style={{
															fontSize: "14px",
															color: "#2563EB",
															textDecoration: "none",
														}}
													>
														{props.providerPhone}
													</a>
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Mail size={14} style={{ color: "#6366F1" }} />
												</td>
												<td>
													<a
														href={`mailto:${props.providerEmail}`}
														style={{
															fontSize: "14px",
															color: "#2563EB",
															textDecoration: "none",
														}}
													>
														{props.providerEmail}
													</a>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</Section>

						{/* Booking Details */}
						<Section
							style={{
								backgroundColor: "#EFF6FF",
								border: "1px solid #DBEAFE",
								borderRadius: "12px",
								padding: "16px",
								marginBottom: "16px",
							}}
						>
							<Text
								style={{
									margin: "0 0 12px 0",
									fontSize: "14px",
									fontWeight: "600",
									color: "#111827",
								}}
							>
								Trip Details
							</Text>

							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "12px" }}>
								<tr>
									<td width="50%" style={{ paddingRight: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Calendar size={16} style={{ color: "#6366F1" }} />
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Date & Time
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															fontWeight: "600",
															color: "#111827",
														}}
													>
														{props.bookingDate}
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															color: "#374151",
														}}
													>
														{props.bookingTime}
													</Text>
												</td>
											</tr>
										</table>
									</td>
									<td width="50%" style={{ paddingLeft: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Car size={16} style={{ color: "#6366F1" }} />
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Vehicle & Passengers
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															fontWeight: "600",
															color: "#111827",
														}}
													>
														{props.vehicleType}
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															color: "#374151",
														}}
													>
														{props.passengerCount} passenger{props.passengerCount > 1 ? "s" : ""}
													</Text>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>

							<Hr style={{ border: "none", borderTop: "1px solid #DBEAFE", margin: "12px 0" }} />

							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td width="50%" style={{ paddingRight: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<MapPin size={16} style={{ color: "#10B981" }} />
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Pickup ({props.pickupTime})
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															color: "#111827",
														}}
													>
														{props.pickupAddress}
													</Text>
												</td>
											</tr>
										</table>
									</td>
									<td width="50%" style={{ paddingLeft: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<MapPin size={16} style={{ color: "#EF4444" }} />
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Dropoff ({props.dropoffTime})
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															color: "#111827",
														}}
													>
														{props.dropoffAddress}
													</Text>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>

							<Hr style={{ border: "none", borderTop: "1px solid #DBEAFE", margin: "12px 0" }} />

							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td width="50%" style={{ paddingRight: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Clock size={16} style={{ color: "#6366F1" }} />
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Duration
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															fontWeight: "600",
															color: "#111827",
														}}
													>
														{props.estimatedDuration}
													</Text>
												</td>
											</tr>
										</table>
									</td>
									<td width="50%" style={{ paddingLeft: "8px" }}>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
													<Text
														style={{
															fontSize: "16px",
															color: "#10B981",
														}}
													>
														£
													</Text>
												</td>
												<td>
													<Text
														style={{
															margin: "0 0 2px 0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Total Cost
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "14px",
															fontWeight: "600",
															color: "#111827",
														}}
													>
														{props.confirmedAmount}
													</Text>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</Section>

						{/* Special Notes */}
						{props.specialNotes && (
							<Section
								style={{
									backgroundColor: "#FFF7ED",
									border: "1px solid #FFEDD5",
									borderLeft: "4px solid #F97316",
									borderRadius: "8px",
									padding: "12px",
									marginBottom: "16px",
								}}
							>
								<Text
									style={{
										margin: "0 0 4px 0",
										fontSize: "14px",
										fontWeight: "600",
										color: "#111827",
									}}
								>
									Special Notes
								</Text>
								<Text
									style={{
										margin: "0",
										fontSize: "14px",
										color: "#374151",
									}}
								>
									{props.specialNotes}
								</Text>
							</Section>
						)}

						{/* Important Info */}
						<Section
							style={{
								backgroundColor: "#F0F9FF",
								border: "1px solid #E0F2FE",
								borderLeft: "4px solid #0EA5E9",
								borderRadius: "8px",
								padding: "12px",
								marginBottom: "16px",
							}}
						>
							<Text
								style={{
									margin: "0 0 4px 0",
									fontSize: "14px",
									fontWeight: "600",
									color: "#111827",
								}}
							>
								📞 Need to Contact Your Driver?
							</Text>
							<Text
								style={{
									margin: "0",
									fontSize: "14px",
									color: "#374151",
								}}
							>
								Your service provider will contact you closer to the pickup time. You can also reach
								them directly using the contact details above.
							</Text>
						</Section>
					</Column>
				</Row>
			</Section>

			{/* Action Buttons */}
			<Section
				style={{
					backgroundColor: "white",
					border: "1px solid #E5E7EB",
					borderBottomLeftRadius: "12px",
					borderBottomRightRadius: "12px",
				}}
			>
				<Row>
					<Column style={{ padding: "16px 24px", textAlign: "center" }}>
						<Text
							style={{
								margin: "0 0 16px 0",
								textAlign: "center",
								fontSize: "14px",
								color: "#6B7280",
							}}
						>
							Save this trip to your calendar:
						</Text>

						<Button
							href={props.googleCalendarUrl}
							style={{
								backgroundColor: "#4285F4",
								color: "white",
								padding: "12px 24px",
								fontSize: "14px",
								fontWeight: "500",
								borderRadius: "8px",
								textDecoration: "none",
								border: "none",
								textAlign: "center",
								minWidth: "180px",
								display: "block",
								margin: "0 auto",
							}}
						>
							📅 Save to Google Calendar
						</Button>
					</Column>
				</Row>
			</Section>

			<EmailFooter companyName={props.companyName} supportEmail={props.supportEmail} />
		</EmailLayout>
	);
};

export default CustomerConfirmationEmailTemplate;
