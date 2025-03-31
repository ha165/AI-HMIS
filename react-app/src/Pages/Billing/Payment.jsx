import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import PdfExportButton from "../../Components/print/PayPdf";
import Header from "../../Components/Header";
import fetchWrapper from "../../Context/fetchWrapper";
import { format } from "date-fns";

const PaymentsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const [filters, setFilters] = useState({
    status: "",
    date_from: "",
    date_to: "",
    appointment_id: "",
  });

  const fetchPayments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(pagination.per_page),
          ...(filters.status && { status: filters.status }),
          ...(filters.date_from && { date_from: filters.date_from }),
          ...(filters.date_to && { date_to: filters.date_to }),
          ...(filters.appointment_id && {
            appointment_id: filters.appointment_id,
          }),
        });

        const data = await fetchWrapper(`/payments?${params.toString()}`);
        setPayments(data.data);
        setPagination({
          current_page: data.meta.current_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          last_page: data.meta.last_page,
        });
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.per_page]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 500); // Debounce filter changes

    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const handlePageChange = (event, value) => {
    fetchPayments(value);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const pdfColumns = [
    { field: "id", headerName: "ID" },
    { field: "formatted_amount", headerName: "Amount" },
    { field: "status", headerName: "Status" },
    {
      field: "payment_date",
      headerName: "Date",
      type: "date",
      format: "PPpp", // Using date-fns format
    },
    { field: "service.name", headerName: "Service" },
    { field: "appointment.id", headerName: "Appointment" },
    { field: "patient.name", headerName: "Patient" },
    { field: "mpesa_receipt", headerName: "Receipt" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "info";
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      date_from: "",
      date_to: "",
      appointment_id: "",
    });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "formatted_amount",
      headerName: "Amount",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{
            fontWeight: "bold",
            textTransform: "capitalize",
            width: "80px",
          }}
        />
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.payment_date
            ? format(new Date(params.row.payment_date), "PPpp")
            : format(new Date(params.row.created_at), "PPpp")}
        </Typography>
      ),
    },
    {
      field: "service",
      headerName: "Service",
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.service?.name || "N/A"}</Typography>
      ),
    },
    {
      field: "appointment",
      headerName: "Appointment",
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.appointment ? `#${params.row.appointment.id}` : "N/A"}
        </Typography>
      ),
    },
    {
      field: "patient",
      headerName: "Patient",
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.patient?.name || "N/A"}</Typography>
      ),
    },
    {
      field: "receipt",
      headerName: "Receipt",
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.mpesa_receipt || "N/A"}</Typography>
      ),
    },
  ];

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Header title="PAYMENTS" subtitle="Payment History" />
            <PdfExportButton
              data={payments}
              columns={pdfColumns}
              title="Payment History Report"
              filters={filters}
              fileName="payment_history"
              buttonProps={{
                sx: { 
                  height: '40px',
                  backgroundColor: colors.blueAccent[500],
                  '&:hover': {
                    backgroundColor: colors.blueAccent[600]
                  }
                }
              }}
            />
          </Box>
          {/* Filters */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap="20px"
            mb="20px"
          >
            <Box gridColumn="span 3">
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box gridColumn="span 3">
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box gridColumn="span 3">
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box gridColumn="span 2">
              <TextField
                fullWidth
                label="Appointment ID"
                value={filters.appointment_id}
                onChange={(e) =>
                  handleFilterChange("appointment_id", e.target.value)
                }
                type="number"
              />
            </Box>

            <Box gridColumn="span 1" display="flex" alignItems="center">
              <Button
                fullWidth
                variant="outlined"
                onClick={resetFilters}
                sx={{ height: "56px" }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Payments Table */}
          <Box
            m="40px 0 0 0"
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[700],
                borderBottom: "none",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.blueAccent[700],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
            }}
          >
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress color="secondary" />
              </Box>
            ) : (
              <DataGrid
                rows={payments}
                columns={columns}
                pageSize={pagination.per_page}
                rowsPerPageOptions={[pagination.per_page]}
                rowCount={pagination.total}
                paginationMode="server"
                onPageChange={handlePageChange}
                disableSelectionOnClick
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentsPage;
