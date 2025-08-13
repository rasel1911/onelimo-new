import { getWorkflowRunByWorkflowRunId } from "@/db/queries/workflow/workflowRun.queries";
import { formatLocation } from "@/lib/utils/formatting";
import { 
    createCommunication,
    updateCommunicationProgress 
} from "@/db/queries/communication.queries";
import { notificationService } from "../communication/communication-factory";
import { WorkflowTrackingService } from "../services/workflowTrackingService";
import { 
    formatBookingDate,
    formatBookingTime,
    generateGoogleCalendarUrl,
    createCalendarEventData 
} from "../utils/confirmation-utils";
interface Location {
    city: string;
    address: string;
    postcode?: string;
}

export interface BookingRequest {
    id: string;
    requestCode: string;
    userId: string;
    customerName: string;
    pickupLocation: Location;
    dropoffLocation: Location;
    pickupTime: Date;
    estimatedDropoffTime: Date;
    estimatedDuration: number;
    vehicleType: string;
    passengers: number;
    specialRequests: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SelectedQuoteDetails {
    quoteId: string;
    providerId: string;
    amount: number;
}

export interface MessageStepData {
    workflowRunId: string;
    bookingRequest: BookingRequest;
    confirmationAnalysis: {
        urgency: string;
    };
    selectedQuoteDetails: SelectedQuoteDetails;
    provider: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    urgent?: boolean;
    question?: string;
}

export interface MessageStepResult {
    success: boolean;
    communicationId?: string;
    notificationResult?: any;
    error?: string;
}

/**
 * Run the message step - send booking questions and store communication
 * @param data - The message step data
 * @returns The result of the message step
 */
export const runMessageStep = async (
    data: MessageStepData,
): Promise<MessageStepResult> => {
    const {
        workflowRunId,
        bookingRequest,
        confirmationAnalysis,
        selectedQuoteDetails,
        provider,
        urgent = false,
        question
    } = data;

    console.log(`✅ [MESSAGE STEP]: Processing message for ${workflowRunId}`);

    try {
        await WorkflowTrackingService.updateWorkflowStatusAndStep(
            workflowRunId,
            "processing_message",
            "Message",
            6,
        );

        const workflowRun = await getWorkflowRunByWorkflowRunId(workflowRunId);

        if (!workflowRun) {
            throw new Error("Workflow run not found");
        }

        const customerContact = {
            name: workflowRun.customerName || bookingRequest.customerName,
            email: workflowRun.customerEmail || "",
            phone: workflowRun.customerPhone || "",
        };

        // Store communication record
        const communicationResult = await createCommunication({
            serviceProviderId: provider.id,
            bookingRequestId: bookingRequest.id,
            subject: "Booking Question",
            status: "pending",
            text: question || "Booking confirmation question",
            progress: 0
        });

        // Create calendar event data and URL
        const calendarEventData = createCalendarEventData(
            bookingRequest,
            selectedQuoteDetails,
            customerContact.name
        );
        const googleCalendarUrl = generateGoogleCalendarUrl(calendarEventData);

        // Send notification to customer
        console.log(`📧 Sending booking question to ${customerContact.name}`);
        const notificationResult = await notificationService.sendProviderConfirmation({
            providerName: provider.name,
            providerEmail: provider.email,
            providerPhone: provider.phone,
            providerId: provider.id,
            
            customerName: customerContact.name,
            customerEmail: customerContact.email,
            customerPhone: customerContact.phone,
            
            bookingId: bookingRequest.requestCode,
            serviceType: bookingRequest.vehicleType,
            bookingDate: formatBookingDate(new Date(bookingRequest.pickupTime)),
            bookingTime: formatBookingTime(new Date(bookingRequest.pickupTime)),
            estimatedDuration: "TBD",
            pickupAddress: formatLocation(bookingRequest.pickupLocation),
            pickupTime: formatBookingTime(new Date(bookingRequest.pickupTime)),
            dropoffAddress: formatLocation(bookingRequest.dropoffLocation),
            dropoffTime: formatBookingTime(new Date(bookingRequest.estimatedDropoffTime)),
            vehicleType: bookingRequest.vehicleType,
            passengerCount: bookingRequest.passengers,
            confirmedAmount: selectedQuoteDetails.amount,
            specialNotes: question || "Booking confirmation question",
            googleCalendarUrl,
            companyName: "Onelimo",
            supportEmail: process.env.SUPPORT_EMAIL,
            urgent: urgent || confirmationAnalysis.urgency === "high"
        });

        // Store step details
        const stepDetails = {
            communication: {
                id: (communicationResult as any)[0]?.id,
                status: "sent"
            },
            notification: {
                success: notificationResult.success,
                resultsCount: notificationResult.results?.length || 0,
                errors: notificationResult.errors
            }
        };

        // Update workflow step
        await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Message", stepDetails);

        // Update communication progress if notification was successful
        if (notificationResult.success && communicationResult) {
            await updateCommunicationProgress(
                (communicationResult as any)[0].id,
                100
            );
        }

        return {
            success: true,
            communicationId: (communicationResult as any)[0]?.id,
            notificationResult
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Failed to process message for ${workflowRunId}:`, errorMessage);

        await WorkflowTrackingService.updateWorkflowStatusAndStep(
            workflowRunId,
            "message_failed",
            "Message",
            6,
        );

        await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Message", {
            error: errorMessage,
            failedAt: new Date().toISOString()
        });

        return {
            success: false,
            error: errorMessage
        };
    }
};
