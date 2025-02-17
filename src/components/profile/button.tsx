import { UserIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function ProfileButton() {
  return (
    <Button variant="outline" size="icon" className="justify-center">
      <UserIcon />
    </Button>
  );
}
