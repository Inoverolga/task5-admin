import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  useNotify,
  useRefresh,
  useListContext,
  TopToolbar,
  Button,
} from "react-admin";
import { Box } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const UserActionsToolbar = () => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleAction = async (endpoint, method = "POST") => {
    if (!selectedIds?.length) {
      notify("Please select users first", { type: "warning" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url =
        method === "DELETE"
          ? "http://localhost:3001/api/auth/users"
          : `http://localhost:3001/api/auth/users/${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          notify(result.error, { type: "error" });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => {
            window.location.href = "#/login";
          }, 1000);
          return;
        }
        throw new Error(result.error || "Operation failed");
      }

      notify(` ${result.message}`);
      refresh();
    } catch (error) {
      notify(`❌ ${error.message}`, { type: "error" });
    }
  };
  const handleDeleteUnverified = async () => {
    if (!selectedIds?.length) {
      notify("Please select users first", { type: "warning" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const allUsersResponse = await fetch(
        "http://localhost:3001/api/auth/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!allUsersResponse.ok) throw new Error("Failed to fetch users");

      const allUsers = await allUsersResponse.json();
      const unverifiedUserIds = allUsers
        .filter(
          (user) =>
            selectedIds.includes(user.id) && user.status === "unverified"
        )
        .map((user) => user.id);

      if (!unverifiedUserIds.length) {
        notify("No unverified users selected", { type: "warning" });
        return;
      }

      const deleteResponse = await fetch(
        "http://localhost:3001/api/auth/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: unverifiedUserIds }),
        }
      );

      if (!deleteResponse.ok) throw new Error("Delete failed");

      notify(`✅ Deleted ${unverifiedUserIds.length} unverified users`, {
        type: "success",
      });
      refresh();
    } catch (error) {
      notify("❌ Error deleting unverified users", { type: "error" });
    }
  };

  return (
    <TopToolbar
      sx={{
        minHeight: "60px",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <span
          style={{ marginRight: "10px", fontWeight: "bold", color: "#666" }}
        >
          {selectedIds?.length || 0} selected
        </span>
        <Button
          label="Block"
          onClick={() => handleAction("block")}
          disabled={!selectedIds?.length}
        >
          <BlockIcon sx={{ mr: 1 }} />
        </Button>
        <Button
          label="Unblock"
          onClick={() => handleAction("unblock")}
          disabled={!selectedIds?.length}
        >
          <LockOpenIcon sx={{ mr: 1 }} />
        </Button>
        <Button
          label="Delete"
          onClick={() => handleAction("", "DELETE")}
          disabled={!selectedIds?.length}
        >
          <DeleteIcon sx={{ mr: 1 }} />
        </Button>
        <Button
          label="Delete Unverified"
          onClick={handleDeleteUnverified}
          disabled={!selectedIds?.length}
        >
          <DeleteOutlineIcon sx={{ mr: 1 }} />
        </Button>
      </Box>
    </TopToolbar>
  );
};

export const UserList = (props) => (
  <List {...props} actions={<UserActionsToolbar />}>
    <Datagrid rowClick={false}>
      <TextField source="name" label="Full Name" sortable />
      <EmailField source="email" sortable />
      <DateField source="lastLogin" label="Last Login" showTime sortable />
      <TextField source="status" sortable />
      <DateField
        source="registrationTime"
        label="Registered"
        showTime
        sortable
      />
    </Datagrid>
  </List>
);
