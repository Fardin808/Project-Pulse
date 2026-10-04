import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject.jsx";
import Tasks from "./pages/Tasks.jsx";
import CreateTask from "./pages/CreateTask.jsx";
import EditTask from "./pages/EditTask.jsx";

import StaffTasks from "./pages/StaffTasks.jsx";
import StaffProjects from "./pages/StaffProjects.jsx";
import StaffProjectTasks from "./pages/StaffProjectTasks.jsx";
import StaffEditTask from "./pages/StaffEditTask.jsx";
import StaffTaskRequest from "./pages/StaffTaskRequest.jsx";
import StaffMyRequests from "./pages/StaffMyRequests.jsx";
import AdminTaskRequests from "./pages/AdminTaskRequests.jsx";
import StaffNotifications from "./pages/StaffNotifications.jsx";
import AdminNotifications from "./pages/AdminNotifications.jsx";



function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Login */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Register */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Admin Dashboard */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* Staff Dashboard */}

        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />


        {/* Admin Projects */}

        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute role="admin">
              <Projects />
            </ProtectedRoute>
          }
        />


        {/* Create Project */}

        <Route
          path="/admin/projects/create"
          element={
            <ProtectedRoute role="admin">
              <CreateProject />
            </ProtectedRoute>
          }
        />


        {/* Project Tasks */}

        <Route
          path="/admin/projects/:projectId/tasks"
          element={
            <ProtectedRoute role="admin">
              <Tasks />
            </ProtectedRoute>
          }
        />


        {/* Create Task */}

        <Route
          path="/admin/projects/:projectId/tasks/create"
          element={
            <ProtectedRoute role="admin">
              <CreateTask />
            </ProtectedRoute>
          }
        />


        {/* Edit Task */}

        <Route
          path="/admin/projects/:projectId/tasks_edit/:taskId"
          element={
            <ProtectedRoute role="admin">
              <EditTask />
            </ProtectedRoute>
          }
        />

        {/* Staff task */}
        <Route
          path="/staff/tasks"
          element={
            <ProtectedRoute role="staff">
              <StaffTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/projects"
          element={
            <ProtectedRoute role="staff">
              <StaffProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/projects/:projectId/tasks"
          element={
            <ProtectedRoute role="staff">
              <StaffProjectTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/tasks/:taskId/edit"
          element={
            <ProtectedRoute role="staff">
              <StaffEditTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/request"
          element={
            <ProtectedRoute role="staff">
              <StaffTaskRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/my-requests"
          element={
            <ProtectedRoute role="staff">
              <StaffMyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/task-requests"
          element={
            <ProtectedRoute role="admin">
              <AdminTaskRequests />
            </ProtectedRoute>
          }
        />

        {/* Staff Notifications */}
        <Route
          path="/staff/notifications"
          element={
            <ProtectedRoute role="staff">
              <StaffNotifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Notifications */}
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute role="admin">
              <AdminNotifications />
            </ProtectedRoute>
          }
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;