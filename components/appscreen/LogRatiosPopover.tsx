import React, { useState } from "react";
import { backendAPI } from "@/lib/api/backend-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LogRatiosPopoverProps {
  onUpdate?: () => void;
}

export function LogRatiosPopover({ onUpdate }: LogRatiosPopoverProps) {
  const [ratios, setRatios] = useState({
    api: 2,
    auth: 2,
    inventory: 2,
    notification: 2,
    payment: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (key: keyof typeof ratios, value: string) => {
    setRatios((prev) => ({ ...prev, [key]: Number(value) }));
  };

  async function updateLogRatios() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await backendAPI.updateDemoLogRatios(ratios);
      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to update log ratios");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Set Log Ratios</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Log Ratios</h4>
            <p className="text-sm text-muted-foreground">
              Set the bad log ratio for each microservice.
            </p>
          </div>
          <div className="grid gap-2">
            {Object.keys(ratios).map((key) => (
              <div className="grid items-center grid-cols-3 gap-4" key={key}>
                <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <Input
                  id={key}
                  type="number"
                  min={0}
                  value={ratios[key as keyof typeof ratios]}
                  onChange={(e) => handleChange(key as keyof typeof ratios, e.target.value)}
                  className="h-8 col-span-2"
                />
              </div>
            ))}
          </div>
          <Button onClick={updateLogRatios} disabled={loading} className="mt-2">
            {loading ? "Updating..." : "Update Ratios"}
          </Button>
          {error && <span className="text-xs text-red-500">{error}</span>}
          {success && <span className="text-xs text-green-500">Updated!</span>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
