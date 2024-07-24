import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import TableToolbar from './tableToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import DeleteDialog from './DeleteDialog';

const DataTable = ({ data, handleDelete, columns, reloadHandler, loading }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleSelectionChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
  };

  const handleClickDelete = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box>
    <DataGrid
              autoHeight
              columns={columns}
              rows={data || []}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              checkboxSelection
              pageSizeOptions={[10, 25, 50, 100]}
              slots={{ noResultsOverlay: NoRowsOverlay, noRowsOverlay: NoRowsOverlay, toolbar: handleDelete ? TableToolbar : undefined }}
              slotProps={{
                toolbar: handleDelete
                  ? {
                      selectedRowCount: rowSelectionModel.length,
                      onDeleteSelected: handleClickDelete,
                      reloadHandler: reloadHandler,
                      loading: loading
                    }
                  : undefined
              }}
              sx={{ '--DataGrid-overlayHeight': '300px' }}
              onRowSelectionModelChange={handleSelectionChange}
              rowSelectionModel={rowSelectionModel}
            />
      <DeleteDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        handleDelete={handleDelete}
        rowSelectionModel={rowSelectionModel}
      />
    </Box>
  );
};

export default DataTable;
