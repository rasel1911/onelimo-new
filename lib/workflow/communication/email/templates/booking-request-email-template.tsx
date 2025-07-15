import { Section, Row, Column, Heading, Text, Button, Hr } from "@react-email/components";
import { Calendar, Clock, Timer, Users, Car, MapPin } from "lucide-react";
import * as React from "react";

import { ProviderEmailTemplateContext } from "@/lib/workflow/types/communication";

import BookingEmailBuilder from "./builders/booking-email-builder";
import EmailFooter from "./components/email-footer";
import EmailHeader from "./components/email-header";
import EmailLayout from "./components/email-layout";

const BookingRequestEmailTemplate: React.FC<ProviderEmailTemplateContext> = (context) => {
	const props = BookingEmailBuilder.buildBookingRequestProps(context);
	const previewText = BookingEmailBuilder.buildPreviewText(context);

	return (
		<EmailLayout previewText={previewText}>
			<EmailHeader companyName={props.companyName} bookingId={props.bookingId} />

			{/* Main Content */}
			<Section
				style={{
					backgroundColor: "white",
					borderLeft: "1px solid #E5E7EB",
					borderRight: "1px solid #E5E7EB",
				}}
			>
				<Row>
					<Column style={{ padding: "16px 24px" }}>
						{/* add greeting */}
						<Text
							style={{
								margin: "0 0 16px 0",
								fontSize: "14px",
								color: "#1F2937",
								fontWeight: "600",
							}}
						>
							Hello {props.providerName},
						</Text>
						{/* Title and Customer */}
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
										{props.urgency === "high" && "🚨 "}
										{props.urgency === "medium" && "⚡ "}
										{props.urgency === "low" && "🚗 "}
										New Booking Request
									</Heading>
									<Text
										style={{
											margin: "0",
											fontSize: "14px",
											color: "#6B7280",
										}}
									>
										<strong>{props.customerName}</strong> • {props.serviceType}
									</Text>
								</td>
								<td
									style={{
										textAlign: "right",
										verticalAlign: "top",
										minWidth: "120px",
									}}
								>
									<table cellPadding="0" cellSpacing="0" style={{ marginLeft: "auto" }}>
										<tr>
											<td
												style={{
													textAlign: "right",
													paddingBottom: "4px",
												}}
											>
												<table cellPadding="0" cellSpacing="0">
													<tr>
														<td
															style={{
																paddingRight: "4px",
																verticalAlign: "middle",
															}}
														>
															<Calendar size={14} />
														</td>
														<td
															style={{
																fontSize: "14px",
																color: "#374151",
															}}
														>
															{props.bookingDate}
														</td>
													</tr>
												</table>
											</td>
										</tr>
										<tr>
											<td style={{ textAlign: "right" }}>
												<table cellPadding="0" cellSpacing="0">
													<tr>
														<td
															style={{
																paddingRight: "4px",
																verticalAlign: "middle",
															}}
														>
															<Clock size={14} />
														</td>
														<td
															style={{
																fontSize: "14px",
																color: "#6B7280",
															}}
														>
															{props.bookingTime}
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>

						{/* Trip Details */}
						<Section
							style={{
								backgroundColor: "#EFF6FF",
								border: "1px solid #DBEAFE",
								borderRadius: "12px",
								padding: "16px",
								marginBottom: "16px",
							}}
						>
							{/* Pickup */}
							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "16px" }}>
								<tr>
									<td
										style={{
											width: "32px",
											verticalAlign: "top",
											paddingRight: "12px",
										}}
									>
										<div
											style={{
												width: "24px",
												height: "24px",
												backgroundColor: "#10B981",
												borderRadius: "50%",
												textAlign: "center",
												lineHeight: "24px",
											}}
										>
											<MapPin
												className="pb-0.5"
												size={14}
												style={{
													color: "white",
													verticalAlign: "middle",
												}}
											/>
										</div>
									</td>
									<td style={{ verticalAlign: "top" }}>
										<Text
											style={{
												margin: "0 0 4px 0",
												fontSize: "14px",
												fontWeight: "600",
												color: "#111827",
											}}
										>
											Pickup Location
										</Text>
										<Text
											style={{
												margin: "0 0 4px 0",
												fontSize: "14px",
												color: "#374151",
											}}
										>
											{props.pickupAddress}
										</Text>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td
													style={{
														paddingRight: "4px",
														verticalAlign: "middle",
													}}
												>
													<Clock size={12} style={{ color: "#6B7280" }} />
												</td>
												<td style={{ fontSize: "12px", color: "#6B7280" }}>{props.pickupTime}</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>

							{/* Connection Line */}
							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "5px" }}>
								<tr>
									<td
										style={{
											width: "32px",
											textAlign: "center",
											paddingRight: "12px",
										}}
									>
										<div
											style={{
												width: "2px",
												height: "10px",
												backgroundColor: "#C7D2FE",
												margin: "0 auto",
											}}
										></div>
									</td>
									<td></td>
								</tr>
							</table>

							{/* Dropoff */}
							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "16px" }}>
								<tr>
									<td
										style={{
											width: "32px",
											verticalAlign: "top",
											paddingRight: "12px",
										}}
									>
										<div
											style={{
												width: "24px",
												height: "24px",
												backgroundColor: "#EF4444",
												borderRadius: "50%",
												textAlign: "center",
												lineHeight: "24px",
											}}
										>
											<MapPin
												className="pb-0.5"
												size={14}
												style={{
													color: "white",
													verticalAlign: "middle",
												}}
											/>
										</div>
									</td>
									<td style={{ verticalAlign: "top" }}>
										<Text
											style={{
												margin: "0 0 4px 0",
												fontSize: "14px",
												fontWeight: "600",
												color: "#111827",
											}}
										>
											Dropoff Location
										</Text>
										<Text
											style={{
												margin: "0 0 4px 0",
												fontSize: "14px",
												color: "#374151",
											}}
										>
											{props.dropoffAddress}
										</Text>
										<table cellPadding="0" cellSpacing="0">
											<tr>
												<td
													style={{
														paddingRight: "4px",
														verticalAlign: "middle",
													}}
												>
													<Clock size={12} style={{ color: "#6B7280" }} />
												</td>
												<td style={{ fontSize: "12px", color: "#6B7280" }}>{props.dropoffTime}</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>

							{/* Trip Stats */}
							<Hr
								style={{
									border: "none",
									borderTop: "1px solid #C7D2FE",
									margin: "16px 0",
								}}
							/>
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td width="33%" style={{ textAlign: "center", padding: "8px" }}>
										<table
											cellPadding="12"
											cellSpacing="0"
											style={{
												backgroundColor: "white",
												borderRadius: "8px",
												width: "100%",
											}}
										>
											<tr>
												<td style={{ textAlign: "center" }}>
													<table
														cellPadding="0"
														cellSpacing="0"
														style={{ margin: "0 auto 4px auto" }}
													>
														<tr>
															<td
																style={{
																	paddingRight: "4px",
																	verticalAlign: "middle",
																}}
															>
																<Timer size={16} style={{ color: "#6366F1" }} />
															</td>
															<td
																style={{
																	fontSize: "14px",
																	fontWeight: "600",
																	color: "#1F2937",
																}}
															>
																{props.estimatedDuration}
															</td>
														</tr>
													</table>
													<Text
														style={{
															margin: "0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Duration
													</Text>
												</td>
											</tr>
										</table>
									</td>
									<td width="33%" style={{ textAlign: "center", padding: "8px" }}>
										<table
											cellPadding="12"
											cellSpacing="0"
											style={{
												backgroundColor: "white",
												borderRadius: "8px",
												width: "100%",
											}}
										>
											<tr>
												<td style={{ textAlign: "center" }}>
													<table
														cellPadding="0"
														cellSpacing="0"
														style={{ margin: "0 auto 4px auto" }}
													>
														<tr>
															<td
																style={{
																	paddingRight: "4px",
																	verticalAlign: "middle",
																}}
															>
																<Users size={16} style={{ color: "#6366F1" }} />
															</td>
															<td
																style={{
																	fontSize: "14px",
																	fontWeight: "600",
																	color: "#1F2937",
																}}
															>
																{props.passengerCount}
															</td>
														</tr>
													</table>
													<Text
														style={{
															margin: "0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Passengers
													</Text>
												</td>
											</tr>
										</table>
									</td>
									<td width="34%" style={{ textAlign: "center", padding: "8px" }}>
										<table
											cellPadding="12"
											cellSpacing="0"
											style={{
												backgroundColor: "white",
												borderRadius: "8px",
												width: "100%",
											}}
										>
											<tr>
												<td style={{ textAlign: "center" }}>
													<table
														cellPadding="0"
														cellSpacing="0"
														style={{ margin: "0 auto 4px auto" }}
													>
														<tr>
															<td
																style={{
																	paddingRight: "4px",
																	verticalAlign: "middle",
																}}
															>
																<Car size={16} style={{ color: "#6366F1" }} />
															</td>
															<td
																style={{
																	fontSize: "14px",
																	fontWeight: "600",
																	color: "#1F2937",
																}}
															>
																{props.vehicleType}
															</td>
														</tr>
													</table>
													<Text
														style={{
															margin: "0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Vehicle
													</Text>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</Section>

						{/* Special Notes - Now using cleanedMessage from analysis */}
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
								<table cellPadding="0" cellSpacing="0">
									<tr>
										<td>
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
										</td>
									</tr>
								</table>
							</Section>
						)}

						{/* Key Points from Analysis */}
						{props.keyPoints && props.keyPoints.length > 0 && (
							<Section
								style={{
									backgroundColor: "#F0FDF4",
									border: "1px solid #DCFCE7",
									borderLeft: "4px solid #22C55E",
									borderRadius: "8px",
									padding: "12px",
									marginBottom: "16px",
								}}
							>
								<table cellPadding="0" cellSpacing="0">
									<tr>
										<td>
											<Text
												style={{
													margin: "0 0 8px 0",
													fontSize: "14px",
													fontWeight: "600",
													color: "#111827",
												}}
											>
												Key Points
											</Text>
											{props.keyPoints.map((point, index) => (
												<Text
													key={index}
													style={{
														margin: "0 0 4px 0",
														fontSize: "14px",
														color: "#374151",
													}}
												>
													• {point}
												</Text>
											))}
										</td>
									</tr>
								</table>
							</Section>
						)}
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
							Please respond to this booking request:
						</Text>

						{/* Primary Action Buttons */}
						<table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto 20px auto" }}>
							<tr>
								<td style={{ paddingBottom: "10px" }}>
									<Button
										href={props.acceptUrl}
										style={{
											backgroundColor: "#059669",
											color: "white",
											padding: "12px 24px",
											fontSize: "14px",
											fontWeight: "500",
											borderRadius: "8px",
											textDecoration: "none",
											border: "none",
											textAlign: "center",
											minWidth: "140px",
											display: "block",
										}}
									>
										✓ Accept Booking
									</Button>
								</td>
							</tr>
							<tr>
								<td>
									<Button
										href={props.declineUrl}
										style={{
											backgroundColor: "#DC2626",
											color: "white",
											padding: "12px 24px",
											fontSize: "14px",
											fontWeight: "500",
											borderRadius: "8px",
											textDecoration: "none",
											border: "none",
											textAlign: "center",
											minWidth: "140px",
											display: "block",
										}}
									>
										✗ Decline Booking
									</Button>
								</td>
							</tr>
						</table>

						{/* View Details Link */}
						<div style={{ textAlign: "center", paddingBottom: "8px" }}>
							<Button
								href={props.viewDetailsUrl}
								style={{
									backgroundColor: "transparent",
									color: "#2563EB",
									padding: "8px 16px",
									fontSize: "14px",
									fontWeight: "500",
									textDecoration: "none",
									borderRadius: "6px",
								}}
							>
								👁 View Full Details →
							</Button>
						</div>
					</Column>
				</Row>
			</Section>

			<EmailFooter companyName={props.companyName} supportEmail={context.supportEmail} />
		</EmailLayout>
	);
};

export default BookingRequestEmailTemplate;
