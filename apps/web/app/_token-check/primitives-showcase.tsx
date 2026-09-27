"use client";

import * as React from "react";
import { DisplayStatus } from "@aptransit/shared";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Spinner,
  StatusBadge,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toaster,
  ToneChip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from "@aptransit/ui";
import {
  ArrowRight,
  Bell,
  Bus,
  ChevronDown,
  Info,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

export function PrimitivesShowcase() {
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [selectedCard, setSelectedCard] = React.useState(false);

  return (
    <div className="flex flex-col gap-10">
      <Toaster />

      {/* 1. Buttons */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">1. Buttons</h3>
        <p className="text-small text-muted">
          Variants: primary, secondary, ghost, danger, link. Sizes: md (44 px), lg (52 px), xl (56 px).
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md">
            Primary md
          </Button>
          <Button variant="secondary" size="md">
            Secondary md
          </Button>
          <Button variant="ghost" size="md">
            Ghost md
          </Button>
          <Button variant="danger" size="md">
            Danger md
          </Button>
          <Button variant="link" size="md">
            Link variant
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg" leftIcon={<Search className="h-4 w-4" />}>
            Search (lg 52 px)
          </Button>
          <Button
            variant="secondary"
            size="xl"
            rightIcon={<ArrowRight className="h-5 w-5" />}
          >
            Driver Action (xl 56 px)
          </Button>
          <Button
            variant="primary"
            loading={btnLoading}
            onClick={() => {
              setBtnLoading(true);
              setTimeout(() => setBtnLoading(false), 2000);
            }}
          >
            {btnLoading ? "Processing" : "Click to test loading"}
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </div>

      {/* 2. IconButtons */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">2. IconButtons</h3>
        <p className="text-small text-muted">
          Required aria-label (TypeScript enforced), 44 px minimum hit area.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton aria-label="Notifications" variant="primary" size="md">
            <Bell className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Settings" variant="secondary" size="md">
            <Settings className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Filter routes" variant="ghost" size="md">
            <SlidersHorizontal className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Delete item" variant="danger" size="md">
            <Info className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Loading action" size="md" loading>
            <Bell className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      {/* 3. Field Wrappers and Inputs */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">3. Field wrappers, Inputs, Textarea</h3>
        <p className="text-small text-muted">
          16 px minimum text (stops iOS zoom), border-strong token for 3:1 boundary contrast, wired ARIA.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field id="demo-boarding" label="Boarding Stop" hint="Select from over 24 AP transit stands" required>
            <Input placeholder="e.g. Kurnool Bus Stand" />
          </Field>
          <Field
            id="demo-phone"
            label="Phone Number"
            error="Please enter a valid 10-digit mobile number"
            required
          >
            <Input placeholder="9876543210" defaultValue="987" />
          </Field>
          <div className="md:col-span-2">
            <Field id="demo-feedback" label="Feedback or Complaint Details" hint="Max 500 characters">
              <Textarea placeholder="Describe your experience or observation..." rows={3} />
            </Field>
          </div>
        </div>
      </div>

      {/* 4. Controls: Select, Checkbox, RadioGroup, Switch */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">4. Controls (Select, Checkbox, Radio, Switch)</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="text-body font-medium text-fg">Select Service Type</span>
            <Select defaultValue="express">
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pallevelugu">Pallevelugu (Ordinary)</SelectItem>
                <SelectItem value="express">Express (Fast Passenger)</SelectItem>
                <SelectItem value="superluxury">Super Luxury (2+2 Pushback)</SelectItem>
                <SelectItem value="amaravati">Amaravati AC (Multi Axle)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-body font-medium text-fg">Radio Group (Quota)</span>
            <RadioGroup defaultValue="general">
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="general" id="r-gen" />
                <label htmlFor="r-gen" className="text-body text-fg cursor-pointer">
                  General quota
                </label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="ladies" id="r-lad" />
                <label htmlFor="r-lad" className="text-body text-fg cursor-pointer">
                  Ladies / Stree Shakti
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="cb-concession" defaultChecked />
            <label htmlFor="cb-concession" className="text-body text-fg cursor-pointer select-none">
              I agree to the travel terms and passenger declaration
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="sw-live"
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
            <label htmlFor="sw-live" className="text-body text-fg cursor-pointer select-none">
              Live tracking alerts {switchChecked ? "(Active)" : "(Paused)"}
            </label>
          </div>
        </div>
      </div>

      {/* 5. Cards */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">5. Cards</h3>
        <p className="text-small text-muted">
          Plain (content container), interactive (clickable row or action), selected (highlighted item).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card variant="plain">
            <span className="text-caption font-mono text-subtle">PLAIN CARD</span>
            <h4 className="text-h3 font-medium text-fg mt-1">Bus Stand Info</h4>
            <p className="text-small text-muted mt-1">Kurnool main terminal with 24 active platforms.</p>
          </Card>

          <Card
            variant="interactive"
            onClick={() => toast.info("Interactive card clicked")}
          >
            <span className="text-caption font-mono text-primary">INTERACTIVE CARD</span>
            <h4 className="text-h3 font-medium text-fg mt-1">Select Route</h4>
            <p className="text-small text-muted mt-1">Kurnool to Vijayawada (Express · 365 km)</p>
          </Card>

          <Card
            variant={selectedCard ? "selected" : "plain"}
            className="cursor-pointer"
            onClick={() => setSelectedCard(!selectedCard)}
          >
            <span className="text-caption font-mono text-primary">
              {selectedCard ? "SELECTED" : "CLICK TO SELECT"}
            </span>
            <h4 className="text-h3 font-medium text-fg mt-1">Seat 18 (Window)</h4>
            <p className="text-small text-muted mt-1">Fare: ₹541 including reservation fee</p>
          </Card>
        </div>
      </div>

      {/* 6. StatusBadges and ToneChips */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">6. Status badges and tone chips</h3>
        <p className="text-small text-muted">
          All 9 display statuses with icons and tokens. Colour is never the only signal.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          {DisplayStatus.options.map((status) => (
            <StatusBadge
              key={status}
              status={status}
              label={status.replace("_", " ")}
              size="md"
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 mt-2">
          <span className="text-caption text-subtle w-full font-mono">SOLID VARIANTS:</span>
          {DisplayStatus.options.map((status) => (
            <StatusBadge
              key={`solid-${status}`}
              status={status}
              label={status.replace("_", " ")}
              size="sm"
              solid
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 mt-2">
          <span className="text-caption text-subtle w-full font-mono">ARBITRARY TONE CHIPS:</span>
          <ToneChip tone="success" label="On time" />
          <ToneChip tone="warning" label="High demand" />
          <ToneChip tone="danger" label="Fast filling" />
          <ToneChip tone="info" label="Stree Shakti eligible" />
        </div>
      </div>

      {/* 7. Skeletons and Spinners */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">7. Skeletons and Spinners</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
          <div className="flex flex-col gap-3">
            <span className="text-caption text-subtle font-mono">SKELETON SHAPES:</span>
            <Skeleton shape="line" className="w-3/4" />
            <Skeleton shape="line" className="w-1/2" />
            <Skeleton shape="block" />
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton shape="line" className="w-2/3" />
                <Skeleton shape="line" className="w-1/3" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-caption text-subtle font-mono">SPINNER SIZES:</span>
            <div className="flex items-center gap-4 text-primary">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
            <Skeleton shape="card" />
          </div>
        </div>
      </div>

      {/* 8. EmptyState and ErrorState */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">8. Empty state and Error state</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border border-default rounded-lg divide-y md:divide-y-0 md:divide-x divide-default">
          <EmptyState
            icon={Bus}
            title="No buses found"
            hint="Try selecting a different date or clearing your route filters."
            action={
              <Button variant="secondary" size="md">
                Reset filters
              </Button>
            }
          />
          <ErrorState
            title="Unable to load timetable"
            message="Could not connect to the booking service. Please check your network and try again."
            retryLabel="Try again"
            requestId="req_872c-901a"
            onRetry={() => toast.info("Retrying request...")}
          />
        </div>
      </div>

      {/* 9. Dialog, Sheet, and Toast */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">9. Dialog, Bottom Sheet, and Toasts</h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Dialog Trigger */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Open Confirmation Dialog</Button>
            </DialogTrigger>
            <DialogContent closeLabel="Close Dialog">
              <DialogHeader>
                <DialogTitle>Cancel Ticket Booking?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel ticket APT-2451-9032? A refund of ₹486 will be initiated to your original payment method.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Keep ticket
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDialogOpen(false);
                    toast.success("Cancellation request submitted.");
                  }}
                >
                  Yes, cancel ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bottom Sheet Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary">Open Mobile Bottom Sheet</Button>
            </SheetTrigger>
            <SheetContent closeLabel="Close Sheet">
              <SheetHeader>
                <SheetTitle>Bus Amenities & Details</SheetTitle>
                <SheetDescription>
                  Vehicle: AP 39 Z 0101 · Super Luxury 2+2 Pushback
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center justify-between text-body border-b border-default pb-2">
                  <span className="text-muted">Charging points</span>
                  <span className="font-medium text-fg">At every row</span>
                </div>
                <div className="flex items-center justify-between text-body border-b border-default pb-2">
                  <span className="text-muted">Air Conditioning</span>
                  <span className="font-medium text-fg">Non-AC</span>
                </div>
                <div className="flex items-center justify-between text-body">
                  <span className="text-muted">Live Tracking</span>
                  <span className="font-medium text-status-success">Online (GPS Active)</span>
                </div>
              </div>
              <SheetFooter>
                <Button variant="primary" className="w-full" onClick={() => setSheetOpen(false)}>
                  Done
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Toast Triggers */}
          <Button
            variant="secondary"
            onClick={() => toast.success("Booking confirmed for Seat 18.")}
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("Bus departure delayed by 12 minutes.")}
          >
            Trigger Info Toast
          </Button>
        </div>
      </div>

      {/* 10. Tabs, Tooltip, DropdownMenu */}
      <div className="flex flex-col gap-4">
        <h3 className="text-h3 font-semibold text-fg">10. Tabs, Tooltip, and DropdownMenu</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="tickets" className="flex-1">
                Active Tickets
              </TabsTrigger>
              <TabsTrigger value="passes" className="flex-1">
                Travel Passes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="p-4 border border-default rounded-md bg-surface-raised mt-2">
              <p className="text-body text-fg">1 active ticket for Kurnool to Vijayawada.</p>
            </TabsContent>
            <TabsContent value="passes" className="p-4 border border-default rounded-md bg-surface-raised mt-2">
              <p className="text-body text-fg">Free travel Stree Shakti pass active (365 days).</p>
            </TabsContent>
            <TabsContent value="history" className="p-4 border border-default rounded-md bg-surface-raised mt-2">
              <p className="text-body text-fg">Past bookings from previous 30 days.</p>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" leftIcon={<Info className="h-4 w-4" />}>
                    Hover for Tooltip
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Free travel is available on all Ordinary and Express services.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" rightIcon={<ChevronDown className="h-4 w-4" />}>
                  Account Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Driver Srinivas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info("Navigating to trips")}>
                  Assigned trips
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Opening scanner")}>
                  QR Scanner
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onClick={() => toast.info("Logging out")}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
