import { useState } from "react";
import { Trash2, Users, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Poll } from "@/hooks/usePolls";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PollCardProps {
  poll: Poll;
  currentUserId: string;
  onVote: (pollId: string, optionId: string) => Promise<{ error: any }>;
  onDelete: (pollId: string) => Promise<{ error: any }>;
}

export function PollCard({ poll, currentUserId, onVote, onDelete }: PollCardProps) {
  const [voting, setVoting] = useState<string | null>(null);

  const isExpired = poll.ends_at && new Date(poll.ends_at) < new Date();
  const isCreator = poll.created_by === currentUserId;
  const hasVoted = poll.user_votes.length > 0;

  const handleVote = async (optionId: string) => {
    if (isExpired) return;
    setVoting(optionId);
    await onVote(poll.id, optionId);
    setVoting(null);
  };

  const getVotePercentage = (voteCount: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  return (
    <Card className={cn(isExpired && "opacity-75")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription className="mt-1">{poll.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isExpired && <Badge variant="secondary">Beendet</Badge>}
            {poll.allow_multiple_votes && (
              <Badge variant="outline" className="text-xs">Mehrfach</Badge>
            )}
            {poll.is_anonymous && (
              <Badge variant="outline" className="text-xs">Anonym</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {poll.total_votes} {poll.total_votes === 1 ? "Stimme" : "Stimmen"}
          </span>
          {poll.ends_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isExpired ? "Endete" : "Endet"} {format(new Date(poll.ends_at), "d. MMM, HH:mm", { locale: de })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getVotePercentage(option.vote_count || 0);
          const isSelected = poll.user_votes.includes(option.id);
          const isVoting = voting === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isExpired || isVoting}
              className={cn(
                "w-full text-left rounded-lg border p-3 transition-all relative overflow-hidden",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected && "border-primary bg-primary/5",
                isExpired && "cursor-default hover:border-border",
                isVoting && "opacity-50"
              )}
            >
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  <span className={cn("text-sm truncate", isSelected && "font-medium")}>
                    {option.option_text}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {percentage}%
                </span>
              </div>
              {(hasVoted || isExpired) && (
                <div className="absolute inset-0 z-0">
                  <Progress
                    value={percentage}
                    className="h-full rounded-none bg-transparent [&>div]:rounded-none [&>div]:bg-primary/10"
                  />
                </div>
              )}
            </button>
          );
        })}

        {isCreator && (
          <div className="pt-2 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Umfrage löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Die Umfrage und alle Stimmen werden dauerhaft gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(poll.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
