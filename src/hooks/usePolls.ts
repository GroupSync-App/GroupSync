import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { notifyGroupMembers } from "@/lib/email";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
  vote_count?: number;
}

export interface Poll {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string | null;
  allow_multiple_votes: boolean;
  is_anonymous: boolean;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  user_votes: string[];
  total_votes: number;
}

interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  allow_multiple_votes?: boolean;
  is_anonymous?: boolean;
  ends_at?: string | null;
  group_id: string;
}

export function usePolls(groupId?: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async () => {
    if (!groupId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch polls
      const { data: pollsData, error: pollsError } = await supabase
        .from("polls")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (pollsError) throw pollsError;

      // Fetch options and votes for each poll
      const pollsWithDetails = await Promise.all(
        (pollsData || []).map(async (poll) => {
          // Get options
          const { data: optionsData } = await supabase
            .from("poll_options")
            .select("*")
            .eq("poll_id", poll.id);

          // Get all votes for this poll
          const { data: votesData } = await supabase
            .from("poll_votes")
            .select("*")
            .eq("poll_id", poll.id);

          // Count votes per option
          const optionsWithCounts = (optionsData || []).map((option) => ({
            ...option,
            vote_count: (votesData || []).filter((v) => v.option_id === option.id).length,
          }));

          // Get user's votes
          const userVotes = (votesData || [])
            .filter((v) => v.user_id === user.id)
            .map((v) => v.option_id);

          return {
            ...poll,
            options: optionsWithCounts,
            user_votes: userVotes,
            total_votes: (votesData || []).length,
          };
        })
      );

      setPolls(pollsWithDetails);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching polls:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (data: CreatePollData) => {
    if (!user) return { error: "Not authenticated" };

    try {
      // Create poll
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert({
          group_id: data.group_id,
          created_by: user.id,
          title: data.title,
          description: data.description || null,
          allow_multiple_votes: data.allow_multiple_votes || false,
          is_anonymous: data.is_anonymous || false,
          ends_at: data.ends_at || null,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create options
      const optionsToInsert = data.options.map((option) => ({
        poll_id: pollData.id,
        option_text: option,
      }));

      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      toast({
        title: "Umfrage erstellt",
        description: "Die Umfrage wurde erfolgreich erstellt.",
      });

      // Notify group members about the new poll
      const creatorName = profile?.display_name || user.email?.split("@")[0] || "Jemand";
      const endsAtFormatted = data.ends_at 
        ? format(new Date(data.ends_at), "dd. MMMM yyyy, HH:mm", { locale: de }) + " Uhr"
        : undefined;

      notifyGroupMembers(data.group_id, user.id, "poll-created", {
        pollTitle: data.title,
        pollDescription: data.description,
        creatorName,
        endsAt: endsAtFormatted,
      }).catch((err) => {
        console.error("Failed to notify group members:", err);
      });

      await fetchPolls();
      return { error: null };
    } catch (err: any) {
      console.error("Error creating poll:", err);
      toast({
        title: "Fehler",
        description: "Umfrage konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) throw new Error("Poll not found");

      // Check if poll has ended
      if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
        toast({
          title: "Umfrage beendet",
          description: "Diese Umfrage ist bereits abgelaufen.",
          variant: "destructive",
        });
        return { error: "Poll ended" };
      }

      // If not allowing multiple votes, remove existing vote first
      if (!poll.allow_multiple_votes && poll.user_votes.length > 0) {
        await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_id", pollId)
          .eq("user_id", user.id);
      }

      // Check if already voted for this option
      if (poll.user_votes.includes(optionId)) {
        // Remove vote
        await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_id", pollId)
          .eq("option_id", optionId)
          .eq("user_id", user.id);
      } else {
        // Add vote
        const { error: voteError } = await supabase
          .from("poll_votes")
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: user.id,
          });

        if (voteError) throw voteError;
      }

      await fetchPolls();
      return { error: null };
    } catch (err: any) {
      console.error("Error voting:", err);
      toast({
        title: "Fehler",
        description: "Stimme konnte nicht abgegeben werden.",
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", pollId)
        .eq("created_by", user.id);

      if (error) throw error;

      toast({
        title: "Umfrage gelöscht",
        description: "Die Umfrage wurde erfolgreich gelöscht.",
      });

      await fetchPolls();
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting poll:", err);
      toast({
        title: "Fehler",
        description: "Umfrage konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [groupId, user]);

  return {
    polls,
    loading,
    error,
    createPoll,
    vote,
    deletePoll,
    refetch: fetchPolls,
  };
}
