import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

const SUGGESTED_SKILLS = [
  "Programmieren",
  "Design",
  "Mathematik",
  "Statistik",
  "Schreiben",
  "Präsentieren",
  "Organisation",
  "Recherche",
  "Marketing",
  "Analyse",
  "Kreativität",
  "Teamführung",
];

interface SkillsSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export function SkillsSelector({ value, onChange, maxSkills = 6 }: SkillsSelectorProps) {
  const [inputValue, setInputValue] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxSkills) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !value.includes(s)
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Skill eingeben..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={value.length >= maxSkills}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => addSkill(inputValue)}
          disabled={!inputValue.trim() || value.length >= maxSkills}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxSkills} Skills ausgewählt
      </p>

      {availableSuggestions.length > 0 && value.length < maxSkills && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Vorschläge:</p>
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.slice(0, 8).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => addSkill(skill)}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
