import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRY_TO_ISO: Record<string, string> = {
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  Brazil: "br",
  Canada: "ca",
  China: "cn",
  Denmark: "dk",
  Finland: "fi",
  France: "fr",
  Germany: "de",
  "Hong Kong": "hk",
  India: "in",
  Ireland: "ie",
  Israel: "il",
  Italy: "it",
  Japan: "jp",
  Kazakhstan: "kz",
  Lebanon: "lb",
  Mexico: "mx",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Qatar: "qa",
  Russia: "ru",
  "Saudi Arabia": "sa",
  Singapore: "sg",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Taiwan: "tw",
  Turkey: "tr",
  UAE: "ae",
  UK: "gb",
  USA: "us",
};

export function countryFlagClass(country: string): string | null {
  const iso = COUNTRY_TO_ISO[country];
  return iso ? `fi fi-${iso}` : null;
}

export function CountryFlag({ country, className }: { country: string; className?: string }) {
  const flagClass = countryFlagClass(country);
  if (!flagClass) {
    return <Globe2 className={cn("h-3.5 w-3.5 text-primary shrink-0", className)} />;
  }
  return (
    <span
      className={cn(flagClass, "rounded-[3px] shrink-0 shadow-sm ring-1 ring-black/10", className)}
      aria-hidden="true"
    />
  );
}
