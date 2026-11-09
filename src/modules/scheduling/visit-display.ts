const appointmentStatusLabels = {
  requested: "Requested",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  no_show: "No-show",
  completed: "Completed",
} as const;

export function appointmentStatusLabel(status: string): string {
  switch (status) {
    case "requested":
    case "confirmed":
    case "cancelled":
    case "no_show":
    case "completed":
      return appointmentStatusLabels[status];
    default:
      return status;
  }
}

const visitTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

export function formatVisitTime(startsAt: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { ...visitTimeOptions, timeZone }).format(
      startsAt,
    );
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      ...visitTimeOptions,
      timeZone: "America/New_York",
    }).format(startsAt);
  }
}

export function describeVehicle(input: {
  year: number | null;
  make: string | null;
  model: string | null;
  licensePlate?: string | null;
}): string {
  if (input.year === null || !input.make || !input.model) {
    return "Not on file";
  }
  const name = `${input.year} ${input.make} ${input.model}`;
  return input.licensePlate ? `${name} (${input.licensePlate})` : name;
}
