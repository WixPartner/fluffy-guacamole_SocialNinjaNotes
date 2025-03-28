import { Box, Typography, Container } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        <Typography variant="body1" paragraph>
          Please read these Terms of Service carefully before using our service.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          1. Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing our service, you agree to be bound by these Terms of Service and comply with all applicable laws and regulations.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          2. Use License
        </Typography>
        <Typography variant="body1" paragraph>
          We grant you a limited, non-exclusive, non-transferable license to use our service for personal or business purposes in accordance with these Terms.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          3. Google Calendar Integration
        </Typography>
        <Typography variant="body1" paragraph>
          Our service integrates with Google Calendar. By using this feature, you grant us permission to access and display your calendar information in accordance with the scope of access you approve.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          4. Disclaimer
        </Typography>
        <Typography variant="body1" paragraph>
          Our service is provided "as is" without any warranties, expressed or implied. We do not guarantee that the service will be uninterrupted or error-free.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          5. Contact
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at: rayanmakran2@gmail.com
        </Typography>
      </Box>
    </Container>
  );
};

export default Terms; 