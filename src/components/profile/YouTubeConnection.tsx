import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Youtube, RefreshCw } from "lucide-react";

interface YouTubeConnectionProps {
  userId: string;
}

export function YouTubeConnection({ userId }: YouTubeConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connectionData, setConnectionData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      await checkConnection();
      await handleOAuthCallback();
    };
    init();
  }, [userId]);

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = sessionStorage.getItem('youtube_oauth_state');
    const redirectUri = sessionStorage.getItem('youtube_redirect_uri');

    if (code && state === 'connecting' && redirectUri) {
      setLoading(true);
      sessionStorage.removeItem('youtube_oauth_state');
      sessionStorage.removeItem('youtube_redirect_uri');

      try {
        // Ensure we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session. Please sign in again.');
        }

        const { data, error } = await supabase.functions.invoke('youtube-complete-auth', {
          body: { code, redirectUri },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        toast({
          title: "Connected successfully!",
          description: `Connected to ${data.channelTitle}`,
        });

        // Clean up URL
        window.history.replaceState({}, document.title, '/profile');
        
        await checkConnection();
      } catch (error: any) {
        console.error('YouTube connection error:', error);
        toast({
          title: "Connection failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_connections')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsConnected(true);
        setConnectionData(data);
      }
    } catch (error) {
      console.error('Error checking YouTube connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/profile`;
      
      // Get auth URL from backend
      const { data, error } = await supabase.functions.invoke('youtube-get-auth-url', {
        body: { redirectUri }
      });

      if (error) throw error;

      // Store state to handle callback
      sessionStorage.setItem('youtube_oauth_state', 'connecting');
      sessionStorage.setItem('youtube_redirect_uri', redirectUri);
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }

      const { error } = await supabase.functions.invoke('youtube-sync', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;

      toast({
        title: "Sync complete",
        description: "Your YouTube data has been updated",
      });

      await checkConnection();
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('youtube_connections')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setIsConnected(false);
      setConnectionData(null);
      
      toast({
        title: "Disconnected",
        description: "Your YouTube account has been disconnected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Youtube className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="font-semibold">YouTube Connection</h3>
              {isConnected && connectionData && (
                <p className="text-sm text-muted-foreground">
                  {connectionData.channel_title}
                </p>
              )}
            </div>
          </div>
          {isConnected ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect} disabled={loading}>
              Connect YouTube
            </Button>
          )}
        </div>

        {isConnected && connectionData && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Subscribers</p>
              <p className="text-2xl font-bold">
                {connectionData.subscriber_count?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Videos</p>
              <p className="text-2xl font-bold">
                {connectionData.video_count?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="text-2xl font-bold">
                {connectionData.view_count?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        )}

        {isConnected && connectionData?.last_synced_at && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(connectionData.last_synced_at).toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
}
