import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { key: "mon", label: "Mo" },
  { key: "tue", label: "Di" },
  { key: "wed", label: "Mi" },
  { key: "thu", label: "Do" },
  { key: "fri", label: "Fr" },
  { key: "sat", label: "Sa" },
  { key: "sun", label: "So" },
];

const TIME_SLOTS = [
  { key: "morning", label: "Morgens", time: "8-12" },
  { key: "afternoon", label: "Nachmittags", time: "12-17" },
  { key: "evening", label: "Abends", time: "17-21" },
];

export type AvailabilityData = {
  [day: string]: string[];
};

interface AvailabilityGridProps {
  value: AvailabilityData;
  onChange: (availability: AvailabilityData) => void;
}

export function AvailabilityGrid({ value, onChange }: AvailabilityGridProps) {
  const toggleSlot = (day: string, slot: string) => {
    const daySlots = value[day] || [];
    const newDaySlots = daySlots.includes(slot)
      ? daySlots.filter((s) => s !== slot)
      : [...daySlots, slot];

    onChange({
      ...value,
      [day]: newDaySlots,
    });
  };

  const isSelected = (day: string, slot: string) => {
    return (value[day] || []).includes(slot);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs text-muted-foreground font-medium text-left"></th>
              {WEEKDAYS.map((day) => (
                <th
                  key={day.key}
                  className="p-2 text-xs text-muted-foreground font-medium text-center"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.key}>
                <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">
                  <div>{slot.label}</div>
                  <div className="text-[10px] opacity-70">{slot.time}</div>
                </td>
                {WEEKDAYS.map((day) => (
                  <td key={`${day.key}-${slot.key}`} className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(day.key, slot.key)}
                      className={cn(
                        "w-8 h-8 rounded-md transition-all duration-200 border",
                        isSelected(day.key, slot.key)
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-muted/30 border-border hover:bg-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {isSelected(day.key, slot.key) && (
                        <span className="text-xs">✓</span>
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Klicke auf die Felder, um deine Verfügbarkeit anzugeben
      </p>
    </div>
  );
}
