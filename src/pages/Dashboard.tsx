import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import AddTaskDialog from '@/components/AddTaskDialog';
import { Link } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  ai_priority_reason?: string;
  scheduled_time?: string;
  created_at: string;
}

interface Profile {
  full_name?: string;
  bio?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Inspirational quotes
  const quotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it."
  ];

  const todayQuote = quotes[new Date().getDay()];

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTasks();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, bio')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !isCompleted })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      } else {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, is_completed: !isCompleted } : task
        ));
        toast({
          title: "Success",
          description: isCompleted ? "Task marked as incomplete" : "Task completed!",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const todayTasks = tasks.filter(task => 
    new Date(task.created_at).toDateString() === new Date().toDateString()
  );

  const completedTasks = tasks.filter(task => task.is_completed);
  const pendingTasks = tasks.filter(task => !task.is_completed);

  const handleSignOut = async () => {
    await signOut();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              TaskMaster
            </h1>
            <p className="text-sm text-muted-foreground">
              {greeting()}, {profile?.full_name || user?.email?.split('@')[0]}! 🌟
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/5 border-primary/20"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" className="hover:bg-primary/5 border-primary/20" asChild>
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" className="hover:bg-destructive/5 border-destructive/20 hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 card-elegant gradient-bg border-0">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Ready to conquer your day?
            </h2>
            <p className="text-white/90 italic mb-6 text-lg">
              "{todayQuote}"
            </p>
            <AddTaskDialog onTaskAdded={fetchTasks} />
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-elegant stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{tasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          
          <Card className="card-elegant bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{completedTasks.length}</div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Great progress!</p>
            </CardContent>
          </Card>
          
          <Card className="card-elegant bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{pendingTasks.length}</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Keep going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Your Tasks
              <AddTaskDialog onTaskAdded={fetchTasks} variant="icon" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No tasks yet. Ready to start being productive?</p>
                <AddTaskDialog onTaskAdded={fetchTasks} />
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks
                  .sort((a, b) => {
                    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200 hover:shadow-md"
                    >
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => toggleTaskComplete(task.id, task.is_completed)}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className={`text-sm ${task.is_completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {task.description}
                          </p>
                        )}
                        {task.ai_priority_reason && (
                          <p className="text-xs text-blue-600 mt-1 italic">
                            🤖 {task.ai_priority_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                
                {completedTasks.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Completed ({completedTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {completedTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30"
                        >
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => toggleTaskComplete(task.id, task.is_completed)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-muted-foreground line-through">
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;