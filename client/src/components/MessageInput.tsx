import React, { useState } from 'react';
import { Box, IconButton, InputBase, Paper, CircularProgress } from '@mui/material';
import { SentIcon, Add01Icon } from 'hugeicons-react';
import { aiApi } from '../api/ai';
import { Block } from '../api/pages';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useSubscription } from '../contexts/SubscriptionContext';

interface MessageInputProps {
  onSend: (blocks: Block[]) => void;
  onAddFile?: () => void;
}

const MessageInput = ({ onSend, onAddFile }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { status } = useSubscription();

  const maxCredits = status?.features?.aiCredits || 10;
  const creditsLeft = maxCredits - (user?.aiCredits?.used || 0);
  const isOutOfCredits = creditsLeft <= 0;

  const handleSend = async () => {
    if (message.trim() && !isLoading && !isOutOfCredits) {
      try {
        setIsLoading(true);
        const blocks = await aiApi.generateBlocks(message);
        onSend(blocks);
        setMessage('');
      } catch (error) {
        console.error('Error generating blocks:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: (theme) => isOutOfCredits ? theme.palette.error.main : 'divider',
          backgroundColor: 'background.paper',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          maxWidth: '800px',
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <IconButton 
          size="small" 
          onClick={onAddFile}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
            p: 0.5
          }}
        >
          <Add01Icon size={20} />
        </IconButton>
        <InputBase
          multiline
          maxRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isOutOfCredits ? "No AI credits left. Upgrade to continue..." : "Type a prompt for AI block generation..."}
          disabled={isLoading || isOutOfCredits}
          sx={{
            flex: 1,
            px: 1,
            py: 0.25,
            fontSize: '0.875rem',
            minHeight: '36px',
            opacity: isOutOfCredits ? 0.6 : 1
          }}
        />
        <IconButton 
          size="small" 
          onClick={handleSend}
          disabled={!message.trim() || isLoading || isOutOfCredits}
          sx={{ 
            color: message.trim() && !isLoading && !isOutOfCredits ? 'primary.main' : 'text.disabled',
            transition: 'all 0.2s ease',
            '&:hover': { 
              color: 'primary.dark'
            },
            p: 0.5
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SentIcon size={20} />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default MessageInput; 