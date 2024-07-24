import React, { useState, useEffect } from 'react';
import { Typography, Box, Collapse, Alert, Backdrop, CircularProgress, Button } from '@mui/material';
import DataTable from '../../components/DataTable';
import AddRuleDialog from '../../components/AddRuleDialog/AddRuleDialog';
import { SERVER_URL } from "../../consts";

const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'source_ip', headerName: 'Source IP', flex: 1 },
  { field: 'destination_ip', headerName: 'Destination IP', flex: 1 },
  { field: 'source_port', headerName: 'Source Port', flex: 1 },
  { field: 'destination_port', headerName: 'Destination Port', flex: 1 },
  { field: 'protocol', headerName: 'Protocol', flex: 1 },
  { field: 'state', headerName: 'State', flex: 1 },
  { field: 'action', headerName: 'Action', flex: 1 },
  { field: 'rate_limit', headerName: 'Rate Limit', flex: 1 },
  { field: 'limit_window', headerName: 'Limit Window', flex: 1 },
  { 
    field: 'log_action', 
    headerName: 'Log Action', 
    flex: 1, 
    renderCell: (params) => (
      <span>{params.value ? 'True' : 'False'}</span>
    )
  }
];

const RuleTable = () => {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState(null);
  const [newRule, setNewRule] = useState({
    source_ip: '',
    destination_ip: '',
    source_port: '',
    destination_port: '',
    protocol: '',
    state: '',
    action: '',
    rate_limit: '',
    log_action: '', // Set to empty string initially
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${SERVER_URL}/api-rule/rule`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err.message);
      setOpenCollapse(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseCollapse = () => {
    setOpenCollapse(false);
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRule((prev) => ({
      ...prev,
      [name]: name === 'log_action' ? value === 'true' : value, // Handle boolean conversion
    }));
  };

  const handleSubmit = async () => {
    try {
      setOpenBackdrop(true);
      console.log('Submitting new rule:', newRule);

      // Validate required fields
      const requiredFields = ['source_ip', 'destination_ip', 'source_port', 'destination_port','rate_limit','limit_window', 'protocol', 'state', 'action'];
      for (const field of requiredFields) {
        if (!newRule[field]) {
          throw new Error(`Field ${field} is required`);
        }
      }

      const response = await fetch(`${SERVER_URL}/api-rule/rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add new rule: ${errorData.error}`);
      }

      fetchData();
      handleCloseDialog();
      setMessage("Rule added successfully");
      setOpenCollapse(true);
      setOpenBackdrop(false);

    } catch (err) {
      setError(err.message);
      setOpenCollapse(true);
      setOpenBackdrop(false);
    }
  };

  const handleDelete = async (selectedIds) => {
    try {
      await Promise.all(selectedIds.map(async (id) => {
        const response = await fetch(`${SERVER_URL}/api-rule/rule/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to delete rule: ${errorData.error}`);
        }
      }));

      fetchData();
      setMessage("Rule deleted successfully");
      setOpenCollapse(true);
    } catch (err) {
      setError(err.message);
      setOpenCollapse(true);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Rules</Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" fontWeight= 'bold' size='Bold' onClick={handleClickOpenDialog}>
          Add New Rule
        </Button>
      </Box>
      <Collapse in={openCollapse}>
        <Alert variant="filled" severity={error ? 'error' : 'info'} sx={{ color: 'white', my: 3 }} onClose={handleCloseCollapse}>
          {error ? `${error}.` : message}
        </Alert>
      </Collapse>
      <DataTable data={rules} columns={columns} loading={isLoading} handleDelete={handleDelete} />
      <Backdrop sx={{ color: '#fff', zIndex: 2000 }} open={openBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <AddRuleDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onChange={handleChange}
        onSubmit={handleSubmit}
        newRule={newRule}
      />
    </Box>
  );
};

export default RuleTable;
