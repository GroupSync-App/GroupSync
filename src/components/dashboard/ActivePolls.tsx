import { useState } from "react";
import { Vote, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Poll } from "@/hooks/usePolls";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ActivePollsProps {
  polls: Poll[];
  loading: boolean;
  getGroupName: (groupId: string) => string;
  onPollUpdate?: () => void;
}

export function ActivePolls({ polls, loading, getGroupName, onPollUpdate }: ActivePollsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null);
  const [voting, setVoting] = useState<string | null>(null);

  const handleVote = async (poll: Poll, optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setVoting(optionId);
    try {
      // If not allowing multiple votes, remove existing vote first
      if (!poll.allow_multiple_votes && poll.user_votes.length > 0) {
        await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_id", poll.id)
          .eq("user_id", user.id);
      }

      // Check if already voted for this option
      if (poll.user_votes.includes(optionId)) {
        await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_id", poll.id)
          .eq("option_id", optionId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("poll_votes")
          .insert({
            poll_id: poll.id,
            option_id: optionId,
            user_id: user.id,
          });
      }

      toast({
        title: "Stimme abgegeben",
        description: "Deine Stimme wurde erfolgreich gezählt.",
      });

      onPollUpdate?.();
    } catch (err) {
      console.error("Error voting:", err);
      toast({
        title: "Fehler",
        description: "Stimme konnte nicht abgegeben werden.",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  };

  const getVotePercentage = (poll: Poll, voteCount: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Vote className="h-4 w-4 text-purple-500" />
            Aktive Umfragen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Vote className="h-4 w-4 text-purple-500" />
          Aktive Umfragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {polls.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine aktiven Umfragen
          </p>
        ) : (
          <div className="space-y-3">
            {polls.slice(0, 5).map((poll) => {
              const isExpanded = expandedPoll === poll.id;
              const hasVoted = poll.user_votes.length > 0;

              return (
                <div
                  key={poll.id}
                  className="rounded-lg bg-muted/50 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedPoll(isExpanded ? null : poll.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{poll.title}</p>
                        {hasVoted && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {getGroupName(poll.group_id)} • {poll.total_votes} Stimmen
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      {poll.options.map((option) => {
                        const percentage = getVotePercentage(poll, option.vote_count || 0);
                        const isSelected = poll.user_votes.includes(option.id);
                        const isVoting = voting === option.id;

                        return (
                          <button
                            key={option.id}
                            onClick={(e) => handleVote(poll, option.id, e)}
                            disabled={isVoting}
                            className={cn(
                              "w-full text-left rounded-md border p-2 transition-all relative overflow-hidden",
                              "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                              isSelected && "border-primary bg-primary/5",
                              isVoting && "opacity-50"
                            )}
                          >
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {isSelected && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                )}
                                <span className={cn("text-xs truncate", isSelected && "font-medium")}>
                                  {option.option_text}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {percentage}%
                              </span>
                            </div>
                            {(hasVoted || poll.total_votes > 0) && (
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
                      <button
                        onClick={() => navigate(`/groups/${poll.group_id}`)}
                        className="w-full text-xs text-primary hover:underline pt-1"
                      >
                        Zur Gruppe →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
