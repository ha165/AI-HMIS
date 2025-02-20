import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Modal,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";

const Billing = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [billings, setbillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedbills, setSelectedbills] = useState(null);
  const [updatedbills, setUpdatedbills] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingbillId, setDeletingbillId] = useState(null);

  useEffect(() => {
    async function fetchbillings() {
      try {
        const res = await fetch("api/billing", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setbillings(data);
      } catch (error) {
        console.error("Error fetching Bills", error);
      } finally {
        setLoading(false);
      }
    }

    fetchbillings();

    const storedRole = localStorage.getItem("role");
    setUserRole(storedRole);
  }, []);

  const handleEdit = (billing) => {
    setSelectedbills(billing);
    setUpdatedbills({
      first_name: billing.first_name,
      last_name: billing.last_name,
      phone: billing.phone,
      email: billing.email,
      gender: billing.gender,
      emergency_contact: billing.emergency_contact,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingbillId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingbillId) return;

    try {
      const response = await fetch(`api/billing/${deletingbillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setbillings(billings.filter((bill) => bill.id !== deletingbillId));
      }
    } catch (error) {
      console.error("Error deleting Bills", error);
    } finally {
      setOpenDeleteModal(false);
      setDeletingbillId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedbills) return;

    const payload = { ...selectedbills, ...updatedbills };
    try {
      const response = await fetch(`api/billing/${selectedbills.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setbillings(
          billings.map((billing) =>
            billing.id === updatedData.id ? updatedData : billing
          )
        );
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error("Error updating Bills", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "due_date", headerName: "Due Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box display="flex" justifyContent="space-around">
            {userRole === "admin" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(params.row)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleDelete(params.row.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header title="BILLS" subtitle="Managing Bills" />
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
              <DataGrid checkboxSelection rows={billings} columns={columns} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-billing-modal"
        aria-describedby="edit-billing-details"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: colors.primary[500],
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Patient
          </Typography>
          <TextField
            label="Amount"
            value={updatedbills.amount || ""}
            onChange={(e) =>
              setUpdatedbills({
                ...updatedbills,
                amount: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="status"
            value={updatedbills.status || ""}
            onChange={(e) =>
              setUpdatedbills({
                ...updatedbills,
                status: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={handleUpdate} variant="contained" color="primary">
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeletingbillId(null);
        }}
        aria-labelledby="delete-confirmation-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: colors.primary[500],
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
          }}
        >
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography variant="body1" mb={3}>
            Are you sure you want to delete this Data? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingbillId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Billing;
