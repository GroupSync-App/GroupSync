import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GroupLink {
  id: string;
  group_id: string;
  created_by: string;
  url: string;
  title: string | null;
  created_at: string;
  creator_name?: string;
}

export function useGroupLinks(groupId: string) {
  const [links, setLinks] = useState<GroupLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLinks = useCallback(async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      
      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from('group_links')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      if (!linksData || linksData.length === 0) {
        setLinks([]);
        return;
      }

      // Fetch creator profiles using the security definer function
      const { data: profiles } = await supabase
        .rpc('get_group_member_profiles', { _group_id: groupId });

      // Map creator names to links
      const linksWithCreators = linksData.map(link => {
        const creator = profiles?.find(p => p.id === link.created_by);
        return {
          ...link,
          creator_name: creator?.display_name || 'Unbekannt'
        };
      });

      setLinks(linksWithCreators);
    } catch (error: any) {
      console.error('Error fetching group links:', error);
      toast({
        title: 'Fehler',
        description: 'Links konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  const addLink = async (url: string, title?: string) => {
    if (!user) {
      toast({
        title: 'Fehler',
        description: 'Du musst angemeldet sein.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('group_links')
        .insert({
          group_id: groupId,
          created_by: user.id,
          url,
          title: title || null
        });

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Link wurde hinzugefügt.'
      });

      await fetchLinks();
      return true;
    } catch (error: any) {
      console.error('Error adding link:', error);
      toast({
        title: 'Fehler',
        description: 'Link konnte nicht hinzugefügt werden.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateLink = async (linkId: string, url: string, title?: string) => {
    try {
      const { error } = await supabase
        .from('group_links')
        .update({ url, title: title || null })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Link wurde aktualisiert.'
      });

      await fetchLinks();
      return true;
    } catch (error: any) {
      console.error('Error updating link:', error);
      toast({
        title: 'Fehler',
        description: 'Link konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('group_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Link wurde entfernt.'
      });

      await fetchLinks();
      return true;
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Fehler',
        description: 'Link konnte nicht entfernt werden.',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    addLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
}
