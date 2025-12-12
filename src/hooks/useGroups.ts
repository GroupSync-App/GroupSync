import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  invite_code: string;
  max_members: number;
  deadline: string | null;
  drive_link: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: {
    display_name: string | null;
    study_program: string | null;
    avatar_url: string | null;
    availability: Record<string, string[]> | null;
    skills: string[] | null;
  };
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  memberCount: number;
}

export function useGroups() {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGroups = async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      // Get groups where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberData.map((m) => m.group_id);

      // Get group details
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      if (groupsError) throw groupsError;

      // Get member counts for each group
      const groupsWithMembers: GroupWithMembers[] = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: members, error: membersError } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", group.id);

          if (membersError) {
            console.error("Error fetching members:", membersError);
            return { ...group, members: [], memberCount: 0 };
          }

          // Fetch profiles using secure RPC function (excludes sensitive data like email)
          const { data: profiles } = await supabase
            .rpc("get_group_member_profiles", { _group_id: group.id });

          const profileMap = new Map(
            (profiles || []).map((p) => [p.id, p])
          );

          const typedMembers: GroupMember[] = (members || []).map((m) => ({
            ...m,
            role: m.role as "owner" | "member",
            profile: profileMap.get(m.user_id) as GroupMember["profile"] || undefined,
          }));

          return {
            ...group,
            members: typedMembers,
            memberCount: typedMembers.length,
          };
        })
      );

      setGroups(groupsWithMembers);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Fehler",
        description: "Gruppen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (data: {
    name: string;
    description?: string;
    subject?: string;
    max_members?: number;
    deadline?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: data.name,
          description: data.description || null,
          subject: data.subject || null,
          max_members: data.max_members || 5,
          deadline: data.deadline || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "Gruppe erstellt",
        description: `"${data.name}" wurde erfolgreich erstellt.`,
      });

      await fetchGroups();
      return { data: newGroup, error: null };
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Fehler",
        description: "Gruppe konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // Find group by invite code using secure RPC function
      const { data: groupData, error: groupError } = await supabase
        .rpc("get_group_by_invite_code", { _invite_code: inviteCode.toLowerCase() });

      if (groupError) throw groupError;
      const group = groupData?.[0];
      if (!group) {
        toast({
          title: "Gruppe nicht gefunden",
          description: "Der Einladungscode ist ungültig.",
          variant: "destructive",
        });
        return { error: new Error("Group not found") };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Bereits Mitglied",
          description: "Du bist bereits Mitglied dieser Gruppe.",
          variant: "destructive",
        });
        return { error: new Error("Already a member") };
      }

      // Check member count (use member_count from RPC)
      if (Number(group.member_count) >= group.max_members) {
        toast({
          title: "Gruppe voll",
          description: "Diese Gruppe hat keine freien Plätze mehr.",
          variant: "destructive",
        });
        return { error: new Error("Group is full") };
      }

      // Join group
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "member",
        });

      if (joinError) throw joinError;

      toast({
        title: "Beigetreten!",
        description: `Du bist "${group.name}" beigetreten.`,
      });

      await fetchGroups();
      return { data: group, error: null };
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Fehler",
        description: "Beitritt fehlgeschlagen.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getGroupByInviteCode = async (inviteCode: string) => {
    // Use secure RPC function that doesn't expose invite codes
    const { data, error } = await supabase
      .rpc("get_group_by_invite_code", { _invite_code: inviteCode.toLowerCase() });

    if (error) {
      console.error("Error fetching group:", error);
      return null;
    }

    const group = data?.[0];
    if (!group) return null;

    return { 
      ...group, 
      memberCount: Number(group.member_count) || 0 
    };
  };

  const getGroupById = async (groupId: string) => {
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError || !group) return null;

    const { data: members } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);

    // Fetch profiles using secure RPC function (excludes sensitive data like email)
    const { data: profiles } = await supabase
      .rpc("get_group_member_profiles", { _group_id: groupId });

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const typedMembers: GroupMember[] = (members || []).map((m) => ({
      ...m,
      role: m.role as "owner" | "member",
      profile: profileMap.get(m.user_id) as GroupMember["profile"] || undefined,
    }));

    return {
      ...group,
      members: typedMembers,
      memberCount: typedMembers.length,
    } as GroupWithMembers;
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Gruppe verlassen",
        description: "Du hast die Gruppe verlassen.",
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error("Error leaving group:", error);
      return { error };
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const deleteGroup = async (groupId: string) => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein.",
        variant: "destructive",
      });
      return { error: new Error("Not authenticated") };
    }

    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId)
        .eq("created_by", user.id);

      if (error) throw error;

      toast({
        title: "Gruppe gelöscht",
        description: "Die Gruppe wurde erfolgreich gelöscht.",
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Fehler",
        description: "Die Gruppe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    groups,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getGroupByInviteCode,
    getGroupById,
    refetch: fetchGroups,
  };
}
