import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <Loader2Icon className="size-10 animate-spin" />
    </div>
  );
}
