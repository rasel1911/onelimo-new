import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

interface AdminFormProps<T> {
  title: string;
  form: any;
  onSubmit: (values: T) => Promise<void>;
  isSubmitting: boolean;
  backUrl: string;
  submitLabel: string;
  submittingLabel: string;
  children: ReactNode;
}

export default function AdminForm<T>({
  title,
  form,
  onSubmit,
  isSubmitting,
  backUrl,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  children
}: AdminFormProps<T>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            Manage {title.toLowerCase()} details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {children}
              
              <div className="flex justify-end gap-4">
                <Link href={backUrl}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 