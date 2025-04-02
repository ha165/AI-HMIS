import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
// Lazy-loaded components
const UserDashboard = lazy(() => import("./Scenes/dashboard/UserDashboard"));
const DiagnosisChat = lazy(() => import("./Pages/AI/DiagnosisChat"));
const ImageAnalyzer = lazy(() => import("./Pages/AI/ImageAnalyzer"));
const Billing = lazy(() => import("./Pages/Billing/Payment"));
const Payment = lazy(() => import("./Pages/Billing/Mpesa"));
const CompleteRegistration = lazy(() =>
  import("./Pages/Patients/complete-Registration")
);
const Home = lazy(() => import("./Pages/Home"));
const DoctorDashboard = lazy(() =>
  import("./Scenes/dashboard/DoctorDashboard")
);
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
const Service = lazy(() => import("./Pages/Service/Service"));
const AddService = lazy(() => import("./Pages/Service/addservice"));
const AddPatient = lazy(() => import("./Pages/Patients/addPatient"));
const AddDoctor = lazy(() => import("./Pages/Doctor/addDoctor"));
const AddMedicalRecords = lazy(() =>
  import("./Pages/Medical_records/add_medicalRecord")
);
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
      <Route path="/home" element={<Home />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/form" element={<Forms />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/bar" element={<Bar />} />
      <Route path="/line" element={<Line />} />
      <Route path="/pie" element={<Pie />} />
      <Route path="/geography" element={<Geography />} />
      <Route path="/diagnosis-chat" element={<DiagnosisChat />} />
      <Route path="/image-analyzer" element={<ImageAnalyzer />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/complete-registration" element={<CompleteRegistration />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/add-appointment" element={<AddAppointment />} />
      <Route path="/add-medicalrecords" element={<AddMedicalRecords />} />
      <Route path="/medical-records" element={<Medical />} />
      <Route path="/add-doctor" element={<AddDoctor />} />
      <Route path="/add-patient" element={<AddPatient />} />
      <Route path="/service" element={<Service />} />
      <Route path="/add-service" element={<AddService />} />
      <Route
        path="/appointments/:appointmentId/medical-record"
        element={<Medical />}
      />
      <Route path="/view-medical-records/:id" element={<ViewmedicalRecord />} />
      <Route path="/payments/:appointmentID" element={<Payment />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={<ProtectedRoute user={user} element={<Dashboard />} />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute user={user} element={<UserDashboard />} />}
      />
      <Route
        path="/doctor-dashboard"
        element={<ProtectedRoute user={user} element={<DoctorDashboard />} />}
      />
    </Routes>
  );
};

export default AppRoutes;
