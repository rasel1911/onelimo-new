import { Section, Row, Column, Heading, Text, Button, Hr } from "@react-email/components";
import { CheckCircle, Clock, Car, MapPin } from "lucide-react";
import * as React from "react";

import { formatStatusText } from "@/lib/utils/formatting";
import { CustomerEmailTemplateContext } from "@/lib/workflow/types/communication";

import { buildQuoteSummaryProps } from "./builders/customer-email-builder";
import EmailFooter from "./components/email-footer";
import EmailHeader from "./components/email-header";
import EmailLayout from "./components/email-layout";

const QuoteSummaryEmailTemplate: React.FC<CustomerEmailTemplateContext> = (context) => {
	const props = buildQuoteSummaryProps(context);
	const previewText = `${props.quotesAvailable} quote${props.quotesAvailable > 1 ? "s" : ""} available for your ${props.vehicleType} booking`;

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
							Hello {props.customerName},
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
										Your Quotes Are Ready!
									</Heading>
									<Text
										style={{
											margin: "0",
											fontSize: "14px",
											color: "#6B7280",
										}}
									>
										We&apos;ve received <strong>{props.quotesAvailable}</strong> quote
										{props.quotesAvailable > 1 ? "s" : ""} from our partners for your{" "}
										{formatStatusText(props.serviceType)} request.
									</Text>
								</td>
							</tr>
						</table>

						{/* Trip Summary */}
						<Section
							style={{
								backgroundColor: "#F3F4F6",
								border: "1px solid #E5E7EB",
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
								Trip Summary
							</Text>

							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "12px" }}>
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
														Pickup
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
														Dropoff
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
						</Section>

						{/* Quote Summary */}
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
								Quote Summary
							</Text>

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
													<Text
														style={{
															margin: "0 0 4px 0",
															fontSize: "18px",
															fontWeight: "600",
															color: "#2563EB",
														}}
													>
														{props.quotesAvailable}
													</Text>
													<Text
														style={{
															margin: "0",
															fontSize: "12px",
															color: "#6B7280",
														}}
													>
														Quotes Available
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
													{props.bestQuoteAmount && (
														<>
															<Text
																style={{
																	margin: "0 0 4px 0",
																	fontSize: "18px",
																	fontWeight: "600",
																	color: "#059669",
																}}
															>
																£{props.bestQuoteAmount}
															</Text>
															<Text
																style={{
																	margin: "0",
																	fontSize: "12px",
																	color: "#6B7280",
																}}
															>
																Best Quote
															</Text>
														</>
													)}
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
													{props.averageQuoteAmount && (
														<>
															<Text
																style={{
																	margin: "0 0 4px 0",
																	fontSize: "18px",
																	fontWeight: "600",
																	color: "#374151",
																}}
															>
																£{props.averageQuoteAmount}
															</Text>
															<Text
																style={{
																	margin: "0",
																	fontSize: "12px",
																	color: "#6B7280",
																}}
															>
																Average Quote
															</Text>
														</>
													)}
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</Section>

						{/* Important Notice */}
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
								⏰ Time Sensitive
							</Text>
							<Text
								style={{
									margin: "0",
									fontSize: "14px",
									color: "#374151",
								}}
							>
								These quotes are valid for 24 hours. Please review and select your preferred option
								to secure your booking.
							</Text>
						</Section>
					</Column>
				</Row>
			</Section>

			{/* Action Button */}
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
							Click below to view all quotes and select your preferred option:
						</Text>

						<Button
							href={props.quotesUrl}
							style={{
								backgroundColor: "#2563EB",
								color: "white",
								padding: "14px 28px",
								fontSize: "16px",
								fontWeight: "600",
								borderRadius: "10px",
								textDecoration: "none",
								border: "none",
								textAlign: "center",
								minWidth: "200px",
								display: "block",
								margin: "0 auto",
							}}
						>
							🔍 View & Select Quotes
						</Button>
					</Column>
				</Row>
			</Section>

			<EmailFooter companyName={props.companyName} supportEmail={context.supportEmail} />
		</EmailLayout>
	);
};

export default QuoteSummaryEmailTemplate;
