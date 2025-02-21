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

const Doctors = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [doctors, setdoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selecteddoctor, setSelecteddoctor] = useState(null);
  const [updateddoctor, setUpdateddoctor] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingdoctorId, setDeletingdoctorId] = useState(null);

  useEffect(() => {
    async function fetchdoctors() {
      try {
        const res = await fetch("api/doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setdoctors(data);
      } catch (error) {
        console.error("Error fetching doctors", error);
      } finally {
        setLoading(false);
      }
    }

    fetchdoctors();

    const storedRole = localStorage.getItem("role");
    setUserRole(storedRole);
  }, []);

  const handleEdit = (doctor) => {
    setSelecteddoctor(doctor);
    setUpdateddoctor({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      phone: doctor.phone,
      email: doctor.email,
      gender: doctor.gender,
      emergency_contact: doctor.emergency_contact,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingdoctorId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingdoctorId) return;

    try {
      const response = await fetch(`api/doctors/${deletingdoctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setdoctors(doctors.filter((doctor) => doctor.id !== deletingdoctorId));
      }
    } catch (error) {
      console.error("Error deleting doctor", error);
    } finally {
      setOpenDeleteModal(false);
      setDeletingdoctorId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selecteddoctor) return;

    const payload = { ...selecteddoctor, ...updateddoctor };
    try {
      const response = await fetch(`api/doctors/${selecteddoctor.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setdoctors(
          doctors.map((doctor) =>
            doctor.id === updatedData.id ? updatedData : doctor
          )
        );
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error("Error updating doctor", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "emergency_contact", headerName: "Emergency Contact", flex: 1 },
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
          <Header title="Doctors" subtitle="Managing the doctors" />
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
              <DataGrid checkboxSelection rows={doctors} columns={columns} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-doctor-modal"
        aria-describedby="edit-doctor-details"
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
            Edit doctor
          </Typography>
          <TextField
            label="First Name"
            value={updateddoctor.first_name || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                first_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            value={updateddoctor.last_name || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                last_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={updateddoctor.phone || ""}
            onChange={(e) =>
              setUpdateddoctor({ ...updateddoctor, phone: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={updateddoctor.email || ""}
            onChange={(e) =>
              setUpdateddoctor({ ...updateddoctor, email: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Gender"
            value={updateddoctor.gender || ""}
            onChange={(
              e // Corrected the typo from "onchannge" to "onChange"
            ) => setUpdateddoctor({ ...updateddoctor, gender: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Emergency Contact"
            value={updateddoctor.emergency_contact || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                emergency_contact: e.target.value,
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
          setDeletingdoctorId(null);
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
            Are you sure you want to delete this doctor? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingdoctorId(null);
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

export default Doctors;
