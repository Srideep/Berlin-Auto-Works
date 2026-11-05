export interface ServiceOffering {
  slug: string;
  name: string;
  summary: string;
  details: string;
}

export const serviceOfferings = [
  {
    slug: "preventive-maintenance",
    name: "Preventive maintenance and oil changes",
    summary: "Scheduled service that keeps a daily driver quiet, clean, and on its interval.",
    details:
      "Oil and filter service, factory-interval inspections, and the small items that prevent a bigger repair. We write down what we checked and what can wait.",
  },
  {
    slug: "diagnostics",
    name: "Diagnostics",
    summary: "A straight read on a check-engine light, a noise, or a problem that comes and goes.",
    details:
      "We test before we replace parts. You get the finding, the options, and what we would do with our own car.",
  },
  {
    slug: "brakes",
    name: "Brakes",
    summary: "Pads, rotors, hydraulics, and the inspection that tells you what is actually worn.",
    details:
      "Measured pad thickness and rotor condition come before a recommendation. We do not sell a brake job you do not need.",
  },
  {
    slug: "tires-alignment",
    name: "Tires and alignment",
    summary: "Tire replacement, rotation, and alignment when the car pulls or the wear is uneven.",
    details:
      "We match the tire to how you drive and check the alignment before the new rubber wears into the old problem.",
  },
  {
    slug: "battery-starting-charging",
    name: "Battery, starter, and alternator",
    summary: "No-start and charging faults, tested instead of guessed.",
    details:
      "A battery, starter, and alternator can fail in ways that look the same from the driver’s seat. We test the circuit before replacing a part.",
  },
  {
    slug: "suspension-steering",
    name: "Suspension and steering",
    summary: "Clunks, wander, and uneven tire wear traced to the part that is actually loose.",
    details:
      "Steering and suspension work starts with a road test and a measured inspection, then an estimate you can approve before we take anything apart.",
  },
  {
    slug: "engine-transmission",
    name: "Engine and transmission",
    summary: "Leaks, slips, and drivability concerns with a scope you approve first.",
    details:
      "Larger repairs start as an estimate. We do not open an engine or transmission on a guess, and we stop if the finding changes the price.",
  },
  {
    slug: "hvac",
    name: "Heating and air conditioning",
    summary: "Weak heat, warm air, and noises from the climate system.",
    details:
      "We check temperature, pressure, and blower operation, then quote the repair. Refrigerant is handled with the proper equipment.",
  },
  {
    slug: "exhaust",
    name: "Exhaust",
    summary: "Leaks, rattles, and emissions components that have failed for a reason.",
    details:
      "An exhaust leak is a noise and a safety issue. We locate it, quote the section that needs replacement, and leave the rest alone.",
  },
  {
    slug: "inspection-prep",
    name: "Pre-purchase and inspection prep",
    summary: "A clear list of what a car needs before you buy it or line it up for inspection.",
    details:
      "You get a written list of what failed, what is close, and what is fine. It is an inspection, not a sales pitch.",
  },
  {
    slug: "fleet-maintenance",
    name: "Fleet maintenance",
    summary: "Repeatable service for work vehicles that have to be back on the road.",
    details:
      "Fleets get the same estimates, repair status, and invoices as everyone else, with scheduling that respects a workday.",
  },
] as const satisfies readonly ServiceOffering[];

export type ServiceSlug = (typeof serviceOfferings)[number]["slug"];

export function getService(slug: string): ServiceOffering | undefined {
  return serviceOfferings.find((service) => service.slug === slug);
}
