import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, Brain, Bell, Palette, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Smart Task Management",
      description: "AI-powered priority suggestions that understand your deadlines and help you focus on what matters most."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Day Planner",
      description: "Plan your days with an intuitive calendar interface and never lose track of your goals."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Assistant",
      description: "Chat with your personal AI assistant powered by Gemini to organize your schedule and get productivity tips."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Smart Reminders",
      description: "Get gentle notifications exactly when you need them, keeping you on track without being intrusive."
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Beautiful Themes",
      description: "Switch between light and dark modes to match your mood and environment."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TaskMaster
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your intelligent personal assistant and planner. Experience productivity that feels effortless, 
            with AI-powered insights that understand your workflow and help you achieve more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why You'll Love TaskMaster</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            More than just a to-do list. TaskMaster combines intelligent automation 
            with beautiful design to create the perfect productivity companion.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who have already discovered the perfect balance 
              of productivity and peace of mind with TaskMaster.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            © 2024 TaskMaster. Built with 💜 for productivity enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
