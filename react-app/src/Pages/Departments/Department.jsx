import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../Context/AppContext"; 
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

const Departments = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useContext(AppContext);
  const [Departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selecteddepartment, setSelecteddepartment] = useState(null);
  const [updateddepartment, setUpdateddepartment] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingdepartmentId, setDeletingdepartmentId] = useState(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("api/departments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching Departments", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const handleEdit = (department) => {
    setSelecteddepartment(department);
    setUpdateddepartment({
      name: department.name,
      description: department.description,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingdepartmentId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingdepartmentId) return;

    try {
      const response = await fetch(`api/departments/${deletingdepartmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setDepartments(Departments.filter((department) => department.id !== deletingdepartmentId));
      }
    } catch (error) {
      console.error("Error deleting department", error);
    } finally {
      setOpenDeleteModal(false);
      setDeletingdepartmentId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selecteddepartment) return;

    const payload = { ...selecteddepartment, ...updateddepartment };
    try {
      const response = await fetch(`api/departments/${selecteddepartment.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setDepartments(
          Departments.map((department) =>
            department.id === updatedData.id ? updatedData : department
          )
        );
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error("Error updating department", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Department Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
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
          <Header title="Departments" subtitle="Managing the Departments" />
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
              <DataGrid checkboxSelection rows={Departments} columns={columns} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-department-modal"
        aria-describedby="edit-department-details"
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
            Edit department
          </Typography>
          <TextField
            label="First Name"
            value={updateddepartment.name || ""}
            onChange={(e) =>
              setUpdateddepartment({
                ...updateddepartment,
                name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            value={updateddepartment.description || ""}
            onChange={(e) =>
              setUpdateddepartment({
                ...updateddepartment,
                description: e.target.value,
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
          setDeletingdepartmentId(null);
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
            Are you sure you want to delete this department? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingdepartmentId(null);
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

export default Departments;
