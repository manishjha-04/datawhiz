import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Box, Container, Grid, Tab, Tabs, Typography, Paper, ThemeProvider } from '@mui/material';
import { FileUpload } from './components/FileUpload';
import { InvoicesTab } from './components/InvoicesTab';
import { ProductsTab } from './components/ProductsTab';
import { CustomersTab } from './components/CustomersTab';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Invoice Data Management System
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
                    <FileUpload />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
                      <Tab label="Invoices" />
                        <Tab label="Products" />
                      <Tab label="Customers" />

                       
                      </Tabs>
                    </Box>

                    <AnimatePresence mode="wait">
                      <motion.div key={currentTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                      <TabPanel value={currentTab} index={2}>
                          <CustomersTab />
                        </TabPanel>
                        <TabPanel value={currentTab} index={0}>
                          <InvoicesTab />
                        </TabPanel>
                        <TabPanel value={currentTab} index={1}>
                          <ProductsTab />
                        </TabPanel>                       
                      </motion.div>
                    </AnimatePresence>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Provider>
    </ThemeProvider>
  );
}

export default App; 