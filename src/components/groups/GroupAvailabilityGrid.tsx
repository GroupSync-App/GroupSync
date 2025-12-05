import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface MemberAvailability {
  user_id: string;
  display_name: string | null;
  availability: { [day: string]: string[] } | null;
}

interface GroupAvailabilityGridProps {
  members: MemberAvailability[];
}

export function GroupAvailabilityGrid({ members }: GroupAvailabilityGridProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const getAvailableMembers = (day: string, slot: string): MemberAvailability[] => {
    return members.filter((member) => {
      const availability = member.availability;
      if (!availability) return false;
      const daySlots = availability[day];
      if (!daySlots) return false;
      return daySlots.includes(slot);
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorClass = (count: number, total: number) => {
    if (count === 0) return "bg-muted/30 border-border";
    const ratio = count / total;
    if (ratio >= 0.8) return "bg-green-500/80 border-green-500 text-white";
    if (ratio >= 0.5) return "bg-green-400/60 border-green-400 text-white";
    if (ratio >= 0.3) return "bg-yellow-400/60 border-yellow-400 text-foreground";
    return "bg-orange-300/50 border-orange-300 text-foreground";
  };

  const totalMembers = members.length;

  if (totalMembers === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Keine Mitglieder mit Verfügbarkeit vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="p-1 text-[10px] sm:text-xs text-muted-foreground font-medium text-left w-12 sm:w-16"></th>
              {WEEKDAYS.map((day) => (
                <th
                  key={day.key}
                  className="p-0.5 sm:p-1 text-[10px] sm:text-xs text-muted-foreground font-medium text-center"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.key}>
                <td className="p-1 text-[10px] sm:text-xs text-muted-foreground">
                  <div className="truncate">{slot.label}</div>
                  <div className="text-[8px] sm:text-[10px] opacity-70">{slot.time}</div>
                </td>
                {WEEKDAYS.map((day) => {
                  const availableMembers = getAvailableMembers(day.key, slot.key);
                  const count = availableMembers.length;
                  const popoverId = `${day.key}-${slot.key}`;

                  return (
                    <td key={popoverId} className="p-0.5 text-center">
                      <Popover
                        open={openPopover === popoverId}
                        onOpenChange={(open) =>
                          setOpenPopover(open ? popoverId : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-6 h-6 sm:w-8 sm:h-8 rounded-md transition-all duration-200 border text-[10px] sm:text-xs font-medium",
                              getColorClass(count, totalMembers),
                              count > 0 && "cursor-pointer hover:scale-105 hover:shadow-md"
                            )}
                            disabled={count === 0}
                          >
                            {count > 0 ? count : ""}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="center">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {count} von {totalMembers} verfügbar
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.label}, {slot.label} ({slot.time} Uhr)
                            </p>
                            <div className="border-t pt-2 mt-2 space-y-2">
                              {availableMembers.map((member) => (
                                <div
                                  key={member.user_id}
                                  className="flex items-center gap-2"
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                      {getInitials(member.display_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm truncate">
                                    {member.display_name || "Unbekannt"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/80 border border-green-500" />
          <span>Alle/Meiste</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-400/60 border border-yellow-400" />
          <span>Einige</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-300/50 border border-orange-300" />
          <span>Wenige</span>
        </div>
      </div>
    </div>
  );
}
