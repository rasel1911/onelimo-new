"use server";

import { render } from "@react-email/components";
import { createElement } from "react";

/**
 * @description
 * Server-side utility to render React Email components to HTML
 * @param Component - The React Email component to render
 * @param props - The props to pass to the component
 * @returns The rendered HTML
 */
export const renderEmailTemplate = async (
	Component: React.ComponentType<any>,
	props: any,
): Promise<string> => {
	try {
		const element = createElement(Component, props);

		return await render(element);
	} catch (error) {
		console.error("Error rendering email template:", error);
		return `
      <html>
        <body>
          <p>There was an error rendering this email template.</p>
          <p>Please contact support if this issue persists.</p>
        </body>
      </html>
    `;
	}
};
