import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
// Lazy-loaded components
const UserDashboard = lazy(() => import("./Scenes/dashboard/UserDashboard"));
const DiagnosisChat = lazy(() => import("./Pages/AI/DiagnosisChat"));
const ImageAnalyzer = lazy(() => import("./Pages/AI/ImageAnalyzer"));
const Billing = lazy(() => import("./Pages/Billing/Billing"));
const Payment = lazy(() => import("./Pages/Billing/Payment"));
const CompleteRegistration = lazy(() =>
  import("./Pages/Patients/complete-Registration")
);
const Home = lazy(() => import("./Pages/Home"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Login = lazy(() => import("./Pages/Auth/Login"));
const Appointments = lazy(() => import("./Pages/Appointmets/Appointments"));
const Departments = lazy(() => import("./Pages/Departments/Department"));
const Dashboard = lazy(() => import("./Scenes/dashboard"));
const AddAppointment = lazy(() => import("./Pages/Appointmets/AddAppointment"));
const Patients = lazy(() => import("./Pages/Patients/Patients"));
const Medical = lazy(() => import("./Pages/Medical_records/Medical_records"));
const Contacts = lazy(() => import("./Pages/Contacts/Contacts"));
const Forms = lazy(() => import("./Pages/Forms/Form"));
const Calendar = lazy(() => import("./Scenes/calendar/calendar"));
const FAQ = lazy(() => import("./Pages/Faq/Faq"));
const Bar = lazy(() => import("./Scenes/bar"));
const Line = lazy(() => import("./Scenes/line"));
const Pie = lazy(() => import("./Scenes/pie"));
const Geography = lazy(() => import("./Scenes/geography"));
const Doctors = lazy(() => import("./Pages/Doctor/Doctor"));
const AddMedicalRecords = lazy(() => import("./Pages/Medical_records/add_medicalRecord"));
const ViewmedicalRecord = lazy(() =>
  import("./Pages/Medical_records/view_medical")
);

// The main Routes component
const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={<ProtectedRoute element={<Dashboard />} user={user} />}
      />
      <Route
        path="/home"
        element={<ProtectedRoute element={<Home />} user={user} />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={<UserDashboard />} user={user} />}
      />
      <Route
        path="/patients"
        element={<ProtectedRoute element={<Patients />} user={user} />}
      />
      <Route
        path="/contacts"
        element={<ProtectedRoute element={<Contacts />} user={user} />}
      />
      <Route
        path="/form"
        element={<ProtectedRoute element={<Forms />} user={user} />}
      />
      <Route
        path="/calendar"
        element={<ProtectedRoute element={<Calendar />} user={user} />}
      />
      <Route
        path="/faq"
        element={<ProtectedRoute element={<FAQ />} user={user} />}
      />
      <Route
        path="/bar"
        element={<ProtectedRoute element={<Bar />} user={user} />}
      />
      <Route
        path="/line"
        element={<ProtectedRoute element={<Line />} user={user} />}
      />
      <Route
        path="/pie"
        element={<ProtectedRoute element={<Pie />} user={user} />}
      />
      <Route
        path="/geography"
        element={<ProtectedRoute element={<Geography />} user={user} />}
      />
      <Route
        path="/diagnosis-chat"
        element={<ProtectedRoute element={<DiagnosisChat />} user={user} />}
      />
      <Route
        path="/image-analyzer"
        element={<ProtectedRoute element={<ImageAnalyzer />} user={user} />}
      />
      <Route
        path="/billing"
        element={<ProtectedRoute element={<Billing />} user={user} />}
      />
      <Route
        path="/complete-registration"
        element={
          <ProtectedRoute element={<CompleteRegistration />} user={user} />
        }
      />
      <Route
        path="/doctors"
        element={<ProtectedRoute element={<Doctors />} user={user} />}
      />
      <Route
        path="/departments"
        element={<ProtectedRoute element={<Departments />} user={user} />}
      />
      <Route
        path="/appointments"
        element={<ProtectedRoute element={<Appointments />} user={user} />}
      />
      <Route
        path="/add-appointment"
        element={<ProtectedRoute element={<AddAppointment />} user={user} />}
      />
      <Route
        path="/add-medicalrecords"
        element={<ProtectedRoute element={<AddMedicalRecords />} user={user} />}
      />

      <Route
        path="/medical-records"
        element={<ProtectedRoute element={<Medical />} user={user} />}
      />
      <Route
        path="/appointments/:appointmentId/medical-record"
        element={<ProtectedRoute element={<Medical />} user={user} />}
        user={user}
      />
      <Route
        path="/view-medical-records/:id"
        element={<ProtectedRoute element={<ViewmedicalRecord />} user={user} />}
      />
      <Route 
       path="/payments/:appointmentID"
       element={<ProtectedRoute element={<Payment />} user={user} />}
      />
    </Routes>
  );
};

export default AppRoutes;
