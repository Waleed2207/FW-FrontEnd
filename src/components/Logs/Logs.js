import React, { useState, useEffect } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';
import { Checkbox } from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';
import { Typography, Collapse, Alert, AlertTitle } from '@mui/material';
import axios from 'axios';
import { SERVER_URL } from "../../consts";

// Combine time and message for LogViewer data
const combineLogs = logs => logs.map(log =>
  Object.keys(log).map(key => `${key}: ${log[key]}`).join(' - ')
).join('\n');

const Logs = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState(null);
  const [openCollapse, setOpenCollapse] = useState(false);

  const handleCloseCollapse = () => {
    setOpenCollapse(false);
  };

  useEffect(() => {
    // Fetch initial logs from the API
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api-logs/initial-logs`);
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    if (newLog) {
      setOpenCollapse(true);
      const timer = setTimeout(() => {
        setOpenCollapse(false);
      }, 5000); // Auto-hide the alert after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [newLog]);

  // Poll for new logs from the API
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api-logs/updated-logs`);
        if (response.status === 200 && response.data) {
          const newLogs = response.data.filter(log => !logs.some(existingLog => existingLog.time === log.time && existingLog.message === log.message));
          if (newLogs.length > 0) {
            setLogs(response.data);
            setNewLog(newLogs[newLogs.length - 1].message); // Set the message of the newest log entry
          }
        }
      } catch (error) {
        if (error.response && error.response.status !== 204) {
          console.error('Error fetching updated logs:', error);
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [logs]);

  return (
    <>
      <Typography variant="h4" mb={3}>Logs</Typography>
      <Collapse in={openCollapse}>
        <Alert
          variant="filled"
          severity='warning'
          sx={{ color: 'white', my: 3 }}
          onClose={handleCloseCollapse}
        >
          <AlertTitle>Warning</AlertTitle>
          {newLog}
        </Alert>
      </Collapse>
      <Checkbox
        label="Dark theme"
        isChecked={isDarkTheme}
        onChange={(_event, value) => setIsDarkTheme(value)}
        aria-label="toggle dark theme checkbox"
        id="toggle-dark-theme"
        name="toggle-dark-theme"
      />
      <LogViewer
        hasLineNumbers={false}
        height={300}
        data={combineLogs(logs)}
        theme={isDarkTheme ? 'dark' : 'light'}
      />
    </>
  );
};

export default Logs;
