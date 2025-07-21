import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddTaskDialogProps {
  onTaskAdded: () => void;
  variant?: 'default' | 'icon';
}

const AddTaskDialog = ({ onTaskAdded, variant = 'default' }: AddTaskDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    setLoading(true);
    try {
      // Call AI prioritization edge function
      const aiResponse = await fetch('/functions/v1/prioritize-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      let priority = 'Medium';
      let ai_priority_reason = null;

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        priority = aiData.priority || 'Medium';
        ai_priority_reason = aiData.reason;
      }

      // Insert task into database
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: priority as 'Low' | 'Medium' | 'High',
          ai_priority_reason,
          scheduled_time: formData.scheduled_time || null,
        });

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Task created with ${priority} priority!`,
        });
        setFormData({ title: '', description: '', scheduled_time: '' });
        setOpen(false);
        onTaskAdded();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button size="sm" className="btn-primary border-0 text-white hover:shadow-lg">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="btn-primary border-0 text-white hover:shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] card-elegant border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. AI will automatically prioritize it for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add task details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time">
              <Clock className="h-4 w-4 inline mr-1" />
              Scheduled Time (Optional)
            </Label>
            <Input
              id="scheduled_time"
              type="datetime-local"
              value={formData.scheduled_time}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()} className="btn-primary border-0 text-white">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;