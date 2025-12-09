import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  groupId: string;
  excludeUserId?: string;
  emailType: "poll-created" | "appointment-created";
  emailData: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { groupId, excludeUserId, emailType, emailData }: NotifyRequest = await req.json();

    console.log(`Notifying group members for ${emailType} in group ${groupId}`);

    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (membersError) {
      console.error("Error fetching group members:", membersError);
      throw membersError;
    }

    // Get group name
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single();

    if (groupError) {
      console.error("Error fetching group:", groupError);
      throw groupError;
    }

    // Filter out the creator if specified
    const memberIds = members
      ?.map((m) => m.user_id)
      .filter((id) => id !== excludeUserId) || [];

    if (memberIds.length === 0) {
      console.log("No members to notify");
      return new Response(JSON.stringify({ message: "No members to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get member profiles with emails
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", memberIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Send emails to all members
    const emailPromises = (profiles || [])
      .filter((p) => p.email)
      .map((profile) => {
        const emailPayload = {
          type: emailType,
          to: profile.email,
          recipientName: profile.display_name || profile.email?.split("@")[0],
          groupName: group?.name || "Gruppe",
          ...emailData,
        };

        console.log(`Sending ${emailType} email to ${profile.email}`);

        return supabase.functions.invoke("send-email", {
          body: emailPayload,
        });
      });

    await Promise.all(emailPromises);

    console.log(`Successfully notified ${emailPromises.length} members`);

    return new Response(
      JSON.stringify({ 
        message: `Notified ${emailPromises.length} members`,
        notifiedCount: emailPromises.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-group-members function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
