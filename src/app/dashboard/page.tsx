"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default (): JSX.Element => (
  <Button
    onClick={() => {
      toast.success("kdj");
    }}
  >
    A
  </Button>
);
