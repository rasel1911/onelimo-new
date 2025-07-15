import {
	MessageSquare,
	MessageCircle,
	Mail,
	Users,
	FileText,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";

import { WORKFLOW_STEP_NAMES } from "@/lib/workflow/constants/booking-tracker";
import { StepIconProps } from "@/lib/workflow/types/booking-tracker";

export function StepIcon({ stepName, className = "size-5" }: StepIconProps) {
	switch (stepName) {
		case WORKFLOW_STEP_NAMES.REQUEST:
			return <MessageSquare className={className} />;
		case WORKFLOW_STEP_NAMES.MESSAGE:
			return <MessageCircle className={className} />;
		case WORKFLOW_STEP_NAMES.NOTIFICATION:
			return <Mail className={className} />;
		case WORKFLOW_STEP_NAMES.PROVIDERS:
			return <Users className={className} />;
		case WORKFLOW_STEP_NAMES.QUOTES:
			return <FileText className={className} />;
		case WORKFLOW_STEP_NAMES.USER_RESPONSE:
			return <MessageSquare className={className} />;
		case WORKFLOW_STEP_NAMES.CONFIRMATION:
		case WORKFLOW_STEP_NAMES.COMPLETE:
			return <CheckCircle2 className={className} />;
		default:
			return <AlertCircle className={className} />;
	}
}
