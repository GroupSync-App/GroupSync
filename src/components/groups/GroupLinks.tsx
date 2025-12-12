import { useState } from 'react';
import { useGroupLinks, GroupLink } from '@/hooks/useGroupLinks';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FolderOpen, Plus, Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface GroupLinksProps {
  groupId: string;
}

function isValidGoogleDriveUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('drive.google.com') || 
           parsed.hostname.includes('docs.google.com');
  } catch {
    return false;
  }
}

export function GroupLinks({ groupId }: GroupLinksProps) {
  const { links, loading, addLink, updateLink, deleteLink } = useGroupLinks(groupId);
  const { user } = useAuth();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState<GroupLink | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [urlError, setUrlError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setUrlError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (link: GroupLink) => {
    setSelectedLink(link);
    setUrl(link.url);
    setTitle(link.title || '');
    setUrlError('');
    setShowEditDialog(true);
  };

  const handleOpenDelete = (link: GroupLink) => {
    setSelectedLink(link);
    setShowDeleteDialog(true);
  };

  const handleAdd = async () => {
    if (!isValidGoogleDriveUrl(url)) {
      setUrlError('Bitte gib eine gültige Google Drive URL ein.');
      return;
    }
    
    setSaving(true);
    const success = await addLink(url, title);
    setSaving(false);
    
    if (success) {
      setShowAddDialog(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!selectedLink) return;
    
    if (!isValidGoogleDriveUrl(url)) {
      setUrlError('Bitte gib eine gültige Google Drive URL ein.');
      return;
    }
    
    setSaving(true);
    const success = await updateLink(selectedLink.id, url, title);
    setSaving(false);
    
    if (success) {
      setShowEditDialog(false);
      setSelectedLink(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedLink) return;
    
    setSaving(true);
    await deleteLink(selectedLink.id);
    setSaving(false);
    
    setShowDeleteDialog(false);
    setSelectedLink(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span>Google Drive Links</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenAdd}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Link hinzufügen
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          Noch keine Links hinterlegt.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div 
              key={link.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm truncate">
                    {link.title || 'Google Drive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  von {link.creator_name} · {format(new Date(link.created_at), 'd. MMM yyyy', { locale: de })}
                </p>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 px-2"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                
                {user?.id === link.created_by && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(link)}
                      className="h-7 px-2"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(link)}
                      className="h-7 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Drive Link hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel (optional)</Label>
              <Input
                id="title"
                placeholder="z.B. Recherche-Ordner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Google Drive URL</Label>
              <Input
                id="url"
                placeholder="https://drive.google.com/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError('');
                }}
              />
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Stelle sicher, dass alle Gruppenmitglieder Zugriff auf den Ordner haben.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAdd} disabled={!url || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel (optional)</Label>
              <Input
                id="edit-title"
                placeholder="z.B. Recherche-Ordner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Google Drive URL</Label>
              <Input
                id="edit-url"
                placeholder="https://drive.google.com/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError('');
                }}
              />
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEdit} disabled={!url || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Link "{selectedLink?.title || 'Google Drive'}" wirklich entfernen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
