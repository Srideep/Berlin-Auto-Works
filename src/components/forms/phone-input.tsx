"use client";

import { useState } from "react";

import {
  formatUsPhoneDisplay,
  formatUsPhoneInput,
  parseUsPhoneDigits,
} from "@/lib/phone";

interface PhoneInputProps {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  describedBy?: string;
  invalid?: boolean;
  autoComplete?: string;
  className: string;
}

export function PhoneInput({
  id,
  name,
  required,
  defaultValue = "",
  describedBy,
  invalid,
  autoComplete,
  className,
}: PhoneInputProps) {
  const initial =
    defaultValue.length > 0
      ? formatUsPhoneDisplay(parseUsPhoneDigits(defaultValue))
      : "";
  const [value, setValue] = useState(initial);

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      required={required}
      autoComplete={autoComplete}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      placeholder="555-555-5555"
      value={value}
      onChange={(event) => {
        setValue(formatUsPhoneInput(event.target.value, value));
      }}
      onBlur={() => {
        const digits = parseUsPhoneDigits(value);
        if (digits.length > 0) {
          setValue(formatUsPhoneDisplay(digits));
        }
      }}
      className={className}
    />
  );
}
