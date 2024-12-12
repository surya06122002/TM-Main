import React, { useState } from "react";
import { useSelector } from "react-redux";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import { useDeleteUserMutation, useGetTeamListQuery, useUserActionMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import { MdOutlineSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, refetch } = useGetTeamListQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [userAction] = useUserActionMutation();

  const handleSearch = () => {
    if (!data) return [];
    if (!searchQuery) return data; // If no query, show all users.

    const lowerCaseQuery = searchQuery.toLowerCase();
    return data.filter((user) =>
      user.name.toLowerCase().includes(lowerCaseQuery)
    );
  };

  const filteredData = handleSearch();

  const userActionHandler = async () => {
    if (!user?.isAdmin) {
      toast.error("Only admins can change user status.");
      return;
    }

    try {
      const result = await userAction({
        isActive: !selected.isActive,
        id: selected?._id,
      });

      refetch();

      toast.success(result.data.message, {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });

      setSelected(null);
      setTimeout(() => {
        setOpenAction(false);
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error.message);
    }
  };

  const deleteHandler = async () => {
    try {
      const result = await deleteUser(selected);

      refetch();

      toast.success("Successfully Deleted", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });

      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error.message);
    }
  };

  const deleteClick = (id) => {
    if (!user?.isAdmin) {
      toast.error("Only admins can delete users", {
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
      return;
    }

    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    if (!user?.isAdmin) {
      toast.error("Only admins can edit users", {
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
      return;
    }

    setSelected(el);
    setOpen(true);
  };

  const userStatusClick = (el) => {
    if (!user?.isAdmin) {
      toast.error("Only admins can change status", {
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
      return;
    }
    setSelected(el);
    setOpenAction(true);
  };

  const navigate = useNavigate();

  const handleViewClick = (e, selectedUserId) => {
    e.stopPropagation(); 

    if (!user?.isAdmin) {
      toast.error("Only admins can view user tasks.", {
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
      return;
    }

    navigate(`/users/${selectedUserId}/tasks`);
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Department</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Active</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => {

    return (
      <tr
        className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10 cursor-pointer"
      >
        <td className="p-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-[#229ea6]">
              <span className="text-xs md:text-sm text-center">
                {getInitials(user.name)}
              </span>
            </div>
            {user.name}
          </div>
        </td>

        <td className="p-2">{user.title}</td>
        <td className="p-2">{user.email || "user.email.com"}</td>
        <td className="p-2">{user.role}</td>

        <td>
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              userStatusClick(user);
            }}
            className={clsx(
              "w-fit px-4 py-1 rounded-full",
              user?.isActive ? "bg-blue-200" : "bg-yellow-100"
            )}
          >
            {user?.isActive ? "Active" : "Disabled"}
          </button>
        </td>

        <td className="p-2 flex gap-4 justify-end">
          {user && (
            <>
              <Button
                className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
                label="Edit"
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  editClick(user);
                }}
              />
              <Button
                className="text-green-600 hover:text-green-500 font-semibold sm:px-0"
                label="View"
                type="button"
                onClick={(e) => handleViewClick(e, user._id)}
              />
              <Button
                className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
                label="Delete"
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  deleteClick(user?._id); 
                }}
              />
            </>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Team Members" />
          {user?.isAdmin && (
            <Button
              label="Add New User"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-[#229ea6] text-white rounded-md 2xl:py-2.5"
              onClick={() => setOpen(true)}
            />
          )}
        </div>

        {/* Search Bar */}
        <div className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-white mb-3'>
          <MdOutlineSearch className='text-gray-500 text-xl' />

          <input
            type='text'
            placeholder='Search....'
            className='flex-1 outline-none bg-white placeholder:text-gray-500 text-gray-800'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    <TableRow key={index} user={user} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};


export default Users;
