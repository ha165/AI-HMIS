import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../Context/AppContext";
import { Link } from "react-router-dom";
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
import fetchWrapper from "../../Context/fetchwrapper";
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";

const MedicalRecords = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatedRecord, setUpdatedRecord] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecords() {
      try {
        const data = await fetchWrapper("/medical-records");
        if (isMounted) {
          setRecords(data);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setUpdatedRecord({
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      medical_history: record.medical_history,
      medications: record.medications,
      allergies: record.allergies,
      treatment_plan: record.treatment_plan,
      notes: record.notes,
      status: record.status,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingRecordId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecordId) return;

    try {
      await fetchWrapper(`/medical-records/${deletingRecordId}`, {
        method: "DELETE",
      });
      setRecords(records.filter((record) => record.id !== deletingRecordId));
    } catch (error) {
      console.error("Error deleting medical record", error);
    } finally {
      setOpenDeleteModal(false);
      setDeletingRecordId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;

    try {
      const updatedData = await fetchWrapper(
        `/medical-records/${selectedRecord.id}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedRecord),
        }
      );
      setRecords(
        records.map((record) =>
          record.id === updatedData.id ? updatedData : record
        )
      );
      setOpenEditModal(false);
    } catch (error) {
      console.error("Error updating medical record", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "patient_name", headerName: "Patient Name", flex: 1 },
    { field: "doctor_name", headerName: "Doctor Name", flex: 1 },
    { field: "diagnosis", headerName: "Diagnosis", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "created_at", headerName: "Created At", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => {
        return (
          <Box display="flex" gap={1}>
            <Button
              component={Link}
              to={`/view-medical-records/${params.row.id}`}
              variant="contained"
              color="info"
              size="small"
            >
              View
            </Button>
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
          <Header title="Medical Records" subtitle="Managing medical records" />
          {(userRole === "doctor" || userRole === "admin") && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                component={Link}
                to="/add-medicalrecords"
                variant="contained"
                color="success"
              >
                Add New Record
              </Button>
            </Box>
          )}
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
              <DataGrid checkboxSelection rows={records} columns={columns} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-record-modal"
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
            Edit Medical Record
          </Typography>
          <TextField
            label="Diagnosis"
            value={updatedRecord.diagnosis || ""}
            onChange={(e) =>
              setUpdatedRecord({ ...updatedRecord, diagnosis: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Prescription"
            value={updatedRecord.prescription || ""}
            onChange={(e) =>
              setUpdatedRecord({
                ...updatedRecord,
                prescription: e.target.value,
              })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Status"
            select
            value={updatedRecord.status || "draft"}
            onChange={(e) =>
              setUpdatedRecord({ ...updatedRecord, status: e.target.value })
            }
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </TextField>
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
          setDeletingRecordId(null);
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
            Are you sure you want to delete this medical record? This action
            cannot be undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingRecordId(null);
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

export default MedicalRecords;
