import { Box, Typography, Container } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        <Typography variant="body1" paragraph>
          This Privacy Policy describes how we collect, use, and handle your information when you use our services.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information that you provide directly to us, including:
          - Google Calendar data when you connect your account
          - Account information when you sign up
          - Usage information as you interact with our service
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
          - Provide, maintain, and improve our services
          - Communicate with you about our services
          - Protect against fraud and abuse
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at: rayanmakran2@gmail.com
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy; 